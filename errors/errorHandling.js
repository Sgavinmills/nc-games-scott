exports.invalidRoute = (req, res, next) => {
    res.status(404).send({message: 'Route not found'})
}

exports.customErrorHandling = (err, req, res, next) => {
    if(err.status && err.msg) {
        res.status(err.status).send({ message : err.msg })
    } else next(err);
}
exports.PSQLerrorHandling = (err, req, res, next) => {
    if(err.code === '22P02') { //Invalid data type
        res.status(400).send({ message : 'Invalid data type' });
    } else if(err.code === '42703') { //Column does not exist
        res.status(400).send( { message : 'Invalid query parameter' } );
    } else if(err.code === '23503') { //ids are valid but contradict foreign key requirement
        res.status(404).send( { message : `One of your values is required to already exist in the database but could not be found` })
    } else if(err.code === '22001') { //value too long for type char(2000)
        res.status(400).send( { message : 'Value too long'})
    } else if(err.code === '2201W') {
        res.status(400).send( { message: 'Limit and page must be greater than 0' })
    } else if(err.code === '2201X') {
        res.status(400).send( { message : "Limit and page must be greater than 0" })
    } else if(err.code === '23502') { //Some null values cause other errors such as psql syntax errors so are handled elsewhere
        res.status(400).send( { message : "Null value not allowed" })
    } else if(err.code === '23505') { //Updating username with a username that already exists (duplicate key value violates unique constraint "users_pkey")
        res.status(400).send( { message : "A property has failed its requirement to be unique"})
    } else if(err.code === '22007') { //invalidfor type 'interval' (when setting time limit of search)
        res.status(400).send( { message : 'Invalid data type' })
    }
    else next(err);
}

exports.serverErrorHandling = (err, req, res, next) => {
    console.log('!!!UNHANDLED ERROR!!!')
    console.log(err); //needs fixing if gets to here
    res.status(500).send({message : 'Internal Server Error' });
}