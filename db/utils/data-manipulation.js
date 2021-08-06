// extract any functions you are using to manipulate your data, into this file


const createRefObj = (arr, ref1, ref2) => {
    const refObj = {};
    arr.forEach((object) => {
        refObj[object[ref1]] = object[ref2]
    })
    return refObj;
};

//produces an array of arrays of the property values from an array of objects
const formatData = (arrOfObjs) => {
    const result = arrOfObjs.map((object) => {
        let newArr = []
        for (const key in object) { //refactor for..in to extract specific key values incase data isn't ordered. 
            newArr.push(object[key])
        }
        return newArr;
    })
    return result;
}

//creates a new property in an object by referencing a refObj. Assigns value of property to replace to the new property. Deletes the property to replace. 
const updateObjectPropertyFromRef = (arr, refObj, propToReplace, newPropertyName) => {
    const newArr = [];
    arr.forEach(obj => {
        let copyObj = {...obj}
        copyObj[newPropertyName] = refObj[copyObj[propToReplace]]
        delete copyObj[propToReplace]
        newArr.push(copyObj);
    })

    return newArr;
}

module.exports = { formatData, createRefObj, updateObjectPropertyFromRef };