const db = require('../db/connection.js');
const { checkExists, checkMissingProperty, checkExtraProperties, isValidQuery, noRequiredPropertys, checkForNulls } = require('../utils.js');


const selectReviews = async (sort_by = 'created_at', order, category, limit = 10, p = 1, minutes, hours, days, months) => {
    let period;
    if(minutes || hours || days || months) {
        const periods = [minutes, hours, days, months];
        let arr = periods.filter(period => period);
        if(arr.length > 1) {
            return Promise.reject( { status : 400, msg : "Only one time period can be provided" })
        } else period = minutes ? 'minutes' : hours ? 'hours' : days ? 'days' : 'months'; 
    }

    const validSortBys = ['owner', 'title', 'review_id', 'category', 'comment_count', 'votes', 'created_at'];
    await isValidQuery(sort_by, validSortBys);

    //if order query is invalid will still return results with default desc
    if (order !== 'asc' && order !== 'desc') {
        direction = 'desc';
    } else direction = order;


    let qryStr = `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, reviews.review_body, COUNT(comment_id) AS comment_count
    FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id `;

    const queryValues = [];
    if (category) {
        await checkExists('categories', 'slug', category);
        queryValues.push(category);
        qryStr += `WHERE category = $${queryValues.length} `;
    }

    if(period) {
        queryValues.push(minutes || hours || days || months);
        if (!category) {
                    //:: casts constructed string into required type interval. || is concatenation in psql
                    qryStr += `WHERE reviews.created_at > current_timestamp - ($${queryValues.length} || ' ${period}')::interval `;
                } else
                    qryStr += `AND reviews.created_at > current_timestamp - ($${queryValues.length} || ' ${period}')::interval `;
    }

    qryStr += `GROUP BY reviews.review_id
               ORDER BY ${sort_by} ${direction} `;


    queryValues.push(limit);
    let dollarValL = queryValues.length;
    const offSet = (p - 1) * limit;
    queryValues.push(offSet);
    let dollarValP = queryValues.length;
    const withoutLimitAndOffsetQryStr = qryStr;
    qryStr += `LIMIT $${dollarValL} OFFSET $${dollarValP}`
    const qryResponse = await db.query(qryStr, queryValues);

    //get total number of results disregarding limit & offset
    queryValues.pop();
    queryValues.pop();
    const qryResponseAll = await db.query(withoutLimitAndOffsetQryStr, queryValues);

    if(qryResponseAll.rows.length > 0 && qryResponse.rows.length === 0) {
        return Promise.reject( { status: 404, msg: "Page doesn't exist" })
    }

    return { reviews: qryResponse.rows, total_count: qryResponseAll.rows.length }

}


const selectReviewsByIdOrTitle = async (review_id_or_title) => {


    const qryValues = [review_id_or_title];
    let qryStr = `SELECT reviews.*, COUNT(comment_id) AS comment_count
                  FROM REVIEWS 
                  LEFT JOIN comments ON reviews.review_id = comments.review_id `

    let isID = false;
    if (/^\d+$/.test(review_id_or_title)) isID = true;
    if (isID) {
        qryStr += `WHERE reviews.review_id = $1 `;

    } else {
        qryStr += `WHERE reviews.title = $1 `;
    }
    qryStr += `GROUP BY reviews.review_id`;
    const qryResponse = await db.query(qryStr, qryValues);
    if (qryResponse.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${review_id_or_title} not found` })
    }
    if (isID) {
        return qryResponse.rows[0];
    } else return qryResponse.rows;
}

const updateReviewsById = async (params, requestBody) => {
    const { review_body, voted_by, vote_type } = requestBody;
    const { review_id } = params;
    const providedProps = Object.keys(requestBody);


    await noRequiredPropertys(['voted_by', 'vote_type', 'review_body'], providedProps);
    await checkForNulls([review_body, voted_by, vote_type]);
    const qryValues = [review_id];
    let qryStr = `UPDATE reviews SET `;
    if(voted_by || vote_type) {
        await checkMissingProperty(['vote_type', 'voted_by'], providedProps)
        //check if user has already voted - query the votes table for review_id and voted_by.
        //ifalready exists then if vote type is same as passed in vote type then delete the vote
        //if vote type doesnt match then update the vote type
        const validTypes = ['up', 'down'];
        if(!validTypes.includes(vote_type)) {
            return Promise.reject({ status: 400, msg: `vote_type must be 'up' or 'down'` })

        }
       
        const checkResponse = await db.query(`SELECT vote_type FROM votes 
                                              WHERE review_id = $1 AND voted_by = $2
                                              `, [review_id, voted_by])
        if(checkResponse.rows.length === 0) {
            const qryResponse = await db.query(`INSERT INTO votes
                                                (review_id, voted_by, vote_type)
                                                VALUES
                                                ($1,$2,$3)`, [review_id, voted_by, vote_type])
            
            qryValues.push(vote_type === 'up' ? 1 : -1);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
            THEN (votes + $${qryValues.length}) ELSE 0 END) `
                                                
        } else  
            if(checkResponse.rows[0].vote_type === vote_type) {
            //delete the vote
            const response = await db.query(`DELETE FROM votes
                                            WHERE review_id = $1`, [review_id]);

            qryValues.push(-1);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
                THEN (votes + $${qryValues.length}) ELSE 0 END) `
                                    
        } else {
            //update vote type
            const response = await db.query(`UPDATE votes
                                             SET vote_type = $1
                                             WHERE review_id = $2`, [vote_type, review_id])

            qryValues.push(vote_type === 'up' ? 2 : -2);
            qryStr += `votes = 
            (CASE WHEN (votes + $${qryValues.length}) >= 0
            THEN (votes + $${qryValues.length}) ELSE 0 END) `
                                     
        } 
    }

    if (review_body) {
        if (vote_type)
            qryStr += ', '
        qryValues.push(review_body);
        qryStr += `review_body = $${qryValues.length} `
    }


    qryStr += `WHERE review_id = $1 RETURNING *;`

    const qryResponse = await db.query(qryStr, qryValues);


    if (qryResponse.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${review_id} not found` })
    }

    

    return qryResponse.rows[0];
}

const selectCommentsByReviewId = async (review_id, limit = 10, p = 1) => {
    const offSet = (p - 1) * limit;
    const qryResponse = await db.query(`SELECT comment_id, votes, created_at, author, body
                                     FROM comments
                                     WHERE review_id = $1
                                     LIMIT $2 OFFSET $3`, [review_id, limit, offSet])
    if (qryResponse.rows.length === 0) {
        await checkExists('reviews', 'review_id', review_id)
    }

    //get total number of response disregarding offset and limit
    const qryResponseAll = await db.query(`SELECT comment_id, votes, created_at, author, body
    FROM comments
    WHERE review_id = $1`, [review_id]);

    return { comments: qryResponse.rows, total_count: qryResponseAll.rows.length }

}

const insertCommentByReviewId = async (review_id, reqBody) => {
    const { username, body } = reqBody
    const bodyProps = Object.keys(reqBody);


    await checkExtraProperties(['username', 'body'], bodyProps);
    await checkMissingProperty(['username', 'body'], bodyProps);
    await checkForNulls([username, body]);
    const qryResponse = await db.query(`INSERT INTO comments
                    (author, body, review_id)
                    VALUES
                    ($1,$2,$3)
                    RETURNING *;`, [username, body, review_id])

    return qryResponse.rows[0];

}

const insertReviews = async (body) => {
    const { title, review_body, designer, category, owner, review_img_url } = body;

    const queryValues = [title, review_body, designer, category, owner];
    const propsProvided = Object.keys(body);

    const requiredProps = ['title', 'review_body', 'designer', 'category', 'owner']



    await checkMissingProperty(requiredProps, propsProvided);
    requiredProps.push('review_img_url');
    await checkExtraProperties(requiredProps, propsProvided)


    let qryStrDolValues;
    if (review_img_url) {
        qryStrCols = `(title, review_body, designer, category, owner, review_img_url)`
        qryStrDolValues = `($1,$2,$3,$4,$5,$6)`
        queryValues.push(review_img_url);
    } else {
        qryStrCols = `(title, review_body, designer, category, owner)`
        qryStrDolValues = `($1,$2,$3,$4,$5)`
    }
    let qryStr = `INSERT INTO reviews
                  ${qryStrCols} 
                  VALUES 
                  ${qryStrDolValues}
                  RETURNING *;`;

    const qryResponse = await db.query(qryStr, queryValues);
    if (!review_img_url)
        delete qryResponse.rows[0].review_img_url;
    qryResponse.rows[0].comment_count = 0;
    return qryResponse.rows[0];
}

const dropReviewById = async (review_id) => {
    const response = await db.query(`DELETE FROM reviews 
                        WHERE review_id = $1 RETURNING *;`, [review_id]);

    if (response.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${review_id} does not exist` })
    }
}

module.exports = { dropReviewById, insertReviews, insertCommentByReviewId, selectReviewsByIdOrTitle, updateReviewsById, selectReviews, selectCommentsByReviewId };



