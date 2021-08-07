const format = require('pg-format');
const db = require('./db/connection.js');

const checkExists = async (table, column, value) => {
    const queryStr = format('SELECT * FROM %I WHERE %I = $1;', table, column);
    const response = await db.query(queryStr, [value]);
    if(response.rows.length === 0) {
        return Promise.reject({ status: 404, msg: `${value} not found`})
    }
}

//for if all properties in a list are required
const checkMissingProperty = async (requiredProperties, providedProperties) => {
    for(let i = 0; i < requiredProperties.length; i++) {
        if(!providedProperties.includes(requiredProperties[i])) {
            return Promise.reject( { status: 400, msg: `${requiredProperties[i]} property required`})
        }
    }
}

//for if only 1 property out of a list is required
const noRequiredPropertys = async (requiredProperties, providedProperties) => {
    for(let i = 0; i < requiredProperties.length; i++) {
        if(providedProperties.includes(requiredProperties[i])) {
            return;
        }
    }
    return Promise.reject( { status: 400, msg: `no required properties provided`})
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

const checkForNulls = async (values) => {
    for(let i = 0; i < values.length; i++) {
        if(values[i] === null) {
            return Promise.reject({ status : 400, msg : 'Null value not allowed' } )
        }
    }
}


//condition is [column-to-check-against, value-to-check] - ie [review_id, 6] will use WHERE review_id = 6;
const updateTable = async(tblName, columns, newValues, condition) => {
    let newQryStr = `UPDATE ${tblName} SET `;
    let newQryValues = [condition[1]];
    for(let i = 0; i < columns.length; i++) {
        if(newValues[i]) {
            if(newQryValues.length > 1) 
              newQryStr += ', ';
            newQryValues.push(newValues[i]);
            newQryStr += `${columns[i]} = $${newQryValues.length} `
        }
    }
    newQryStr += `WHERE ${condition[0]} = $1 RETURNING *;`
    const qryResponse = await db.query(newQryStr, newQryValues);
    return qryResponse;
}

module.exports = { updateTable, checkForNulls,checkExists, checkMissingProperty, checkExtraProperties, isValidQuery, noRequiredPropertys}