const format = require('pg-format');
const db = require('./db/connection.js');

const checkExists = async (table, column, value) => {
    const queryStr = format('SELECT * FROM %I WHERE %I = $1;', table, column);
    const response = await db.query(queryStr, [value]);
    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${value} not found`})
    }
}

const checkMissingProperty = async (requiredProperties, providedProperties) => {
    for(let i = 0; i < requiredProperties.length; i++) {
        if(!providedProperties.includes(requiredProperties[i])) {
            return Promise.reject( { status: 400, msg: `${requiredProperties[i]} property required`})
        }
    }
}

const checkExtraProperties = async (allowedProperties, providedProperties) => {
    for(let i = 0; i < providedProperties.length; i++) {
        if(!allowedProperties.includes(providedProperties[i])) {
          return Promise.reject( { status: 400, msg: `Too many properties provided` })
        }
    }
}

const isValidQuery = async (query, validQuerys) => {
    if(!validQuerys.includes(query)) {
      return Promise.reject({ status: 400, msg: `Invalid query: ${query}` })
    }
}

module.exports = { checkExists, checkMissingProperty, checkExtraProperties, isValidQuery}