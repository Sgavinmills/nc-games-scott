const express = require('express');
const { invalidRoute, PSQLerrorHandling, serverErrorHandling, customErrorHandling } = require('./errors/errorHandling');
const apiRouter = require('./routers/api-router');

const app = express();
app.use(express.json());
app.use('/api', apiRouter);


//error handling
app.all('/*', invalidRoute);



app.use(customErrorHandling);
app.use(PSQLerrorHandling);
app.use(serverErrorHandling);

module.exports = app;