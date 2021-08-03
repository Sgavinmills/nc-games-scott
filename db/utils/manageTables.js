const format = require('pg-format');
const db = require('../connection.js');

const dropTables = async (tblNames) => {
    for(let i = 0; i < tblNames.length; i++) {
        await db.query(`DROP TABLE IF EXISTS ${tblNames[i]}`);
    }
}

const createTables = async (tbls) => { //tbls is nested array with each inner array comprising [[tblName,[columns]]]
    for(let i = 0; i < tbls.length; i++) {
        createTableQueryStr = `CREATE TABLE ${tbls[i][0]} (`;
        tbls[i][1].forEach((column, index) => {
            createTableQueryStr += column;
            if(index !== tbls[i][1].length - 1) 
                createTableQueryStr += ',';
        })
        createTableQueryStr += `);`;
        await db.query(createTableQueryStr);
    }
    return tbls.length; //returns how many tables were created
}
const insertData = async (arrayOfTablesDataInfo) => { //takes a nested array with each inner array comprising [tableName, [columnheaders], [values]]
    const responses = [];
    for(let i = 0; i < arrayOfTablesDataInfo.length; i++) {
        let columnStr = arrayOfTablesDataInfo[i][1].toString();
        let queryStr = format(`INSERT INTO ${arrayOfTablesDataInfo[i][0]}
        (${columnStr})
        VALUES
        %L
        RETURNING *;`, arrayOfTablesDataInfo[i][2]);
        let r = await db.query(queryStr);
        responses.push(r.rows);
    }
    return responses; //returns an array of responses from each insert query
}

module.exports = { dropTables, insertData, createTables };