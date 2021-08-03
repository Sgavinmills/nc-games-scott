const apiRouter = require('express').Router();
const categoriesRouter = require('./categories-router.js')
const reviewsRouter = require('./reviews-router.js')


apiRouter.get('/', (req, res, next) => {
    res.status(200).send({message : 'All OK - now try a proper route'})
})

apiRouter.use('/categories', categoriesRouter); 
apiRouter.use('/reviews', reviewsRouter);



module.exports = apiRouter;