// extract any functions you are using to manipulate your data, into this file

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

module.exports = { formatData }