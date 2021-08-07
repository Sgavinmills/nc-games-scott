const db = require('../db/connection.js');
const { updateTable, checkForNulls, checkExtraProperties, noRequiredPropertys } = require('../utils.js');


const selectUsers = async () => {
    const qryResponse = await db.query('SELECT username FROM users');
    return qryResponse.rows;
}

const selectUsersByUserName = async (username) => {
    const qryResponse = await db.query(`SELECT * FROM users
                                        WHERE username = $1`, [username]);
    if(qryResponse.rows.length === 0) {
        return Promise.reject({ status : 404, msg : `${username} not found`})
    }
    return qryResponse.rows[0];
}

const updateUsersByUserName = async (currentUsername, reqBody) => {
    const { avatar_url, name, username } = reqBody;

    await checkForNulls([avatar_url, name, username]);
    await checkExtraProperties(['avatar_url', 'name', 'username'], Object.keys(reqBody)); //separate these into variables
    await noRequiredPropertys(['avatar_url', 'name', 'username'], Object.keys(reqBody))
        

    let tblName = 'users';
    let columns = ['avatar_url', 'name', 'username'];
    let newValues = [avatar_url, name, username];
    let condition = ['username', currentUsername] //column to check against, value to check against
    const qryResponse = await updateTable(tblName, columns, newValues, condition)


    if(qryResponse.rows.length === 0) {
        return Promise.reject({status: 404, msg : `${currentUsername} not found`})
    }
    return qryResponse.rows[0];

}

module.exports = { selectUsers, selectUsersByUserName,updateUsersByUserName };