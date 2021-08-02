// extract any functions you are using to manipulate your data, into this file

const createRefObj = (arr, ref1, ref2) => {
    const refObj = {};
    arr.forEach((object) => {
        refObj[object[ref1]] = object[ref2]
    })
    return refObj;
};


const formatData = (arrOfObjs) => {
    const copy = [...arrOfObjs];
    const result = copy.map((object) => {
        let newArr = []
        for (const key in object) {

            newArr.push(object[key])
        }
        return newArr;
    })
    return result;
}



module.exports = { formatData, createRefObj };