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
        res.status(404).send( { message : `One of your values contradicts a foreign key constraint` })
    } else if(err.code === '22001') { //value too long for type char(2000)
        res.status(400).send( { message : 'Value too long'})
    }
    else next(err);
}

exports.serverErrorHandling = (err, req, res, next) => {
    console.log('!!!UNHANDLED ERROR!!!')
    console.log(err); //needs fixing if gets to here
    res.status(500).send({message : 'Internal Server Error' });
}