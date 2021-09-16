const apiRouter = require('express').Router();
const categoriesRouter = require('./categories-router.js')
const reviewsRouter = require('./reviews-router.js')
const commentsRouter = require('./comments-router.js')
const usersRouter = require('./users-router.js')
const votesRouter = require('./votes-router.js')
const fs = require('fs/promises');
const axios = require('axios');


apiRouter.get('/', async (req, res, next) => {
    const apiMap = await fs.readFile('./endpointlist.json','utf-8');
    const parsedApiMap = JSON.parse(apiMap);
    res.status(200).send({endpoints : parsedApiMap})
})

apiRouter.use('/categories', categoriesRouter); 
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/votes', votesRouter);

// apiRouter.get('/restaurants', (req, res) => {
//     const reviewsAPI = axios.create({
//         baseURL: "https://api.yelp.com/v3/businesses/",
//     });
//     const API_KEY = process.env.REACT_APP_API_KEY;

//     const response = reviewsAPI.get('/search?location=Manchester', {
//         // params: {
          
//         // },
//         headers: {
//             Authorization : `Bearer ${API_KEY}`
//         }
//     })
//     .then(response => {

//         console.log(response.data);
//         res.status(200).send({restaurants: response.data});
//     })
// })



module.exports = apiRouter;