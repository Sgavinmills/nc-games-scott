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
        res.status(400).send({ message : 'Invalid request' });
    } else next(err);
}

exports.serverErrorHandling = (err, req, res, next) => {
    console.log('ERROR ->' + err); //needs fixing if gets to here
    res.status(500).send({message : 'Internal Server Error' });
}