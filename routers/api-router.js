const apiRouter = require('express').Router();
const categoriesRouter = require('./categories-router.js')
const reviewsRouter = require('./reviews-router.js')
const commentsRouter = require('./comments-router.js')
const usersRouter = require('./users-router.js')
const fs = require('fs/promises');


apiRouter.get('/', async (req, res, next) => {
    const apiMap = await fs.readFile('./endpointlist.json','utf-8');
    res.status(200).send(apiMap)
    //res.status(200).send({message : 'All OK - now try a proper route'})
})

apiRouter.use('/categories', categoriesRouter); 
apiRouter.use('/reviews', reviewsRouter);
apiRouter.use('/comments', commentsRouter);
apiRouter.use('/users', usersRouter);



module.exports = apiRouter;