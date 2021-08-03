const { formatData, createRefObj, updateObjectPropertyFromRef } = require('../db/utils/data-manipulation.js');

describe('formatData()', () => {
    test('Returns new array', () => {
        const input = [{}];
        expect(formatData(input)).not.toBe(input);
        expect(Array.isArray(formatData(input)));
    })
    test('Doesnt mutate input', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }];
        formatData(input);
        expect(input).toEqual([{ slug: 'euro game', description: 'Abstact games that involve little luck' }])
    })
    test('Returns nested array of object values for single object', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }]
        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck']])
    })
    test('Returns nested array of object values for multiple objects', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }, { slug: "children's games", description: 'Games suitable for children' }]
        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck'], [`children's games`, `Games suitable for children`]])
    })
    test('Returns nested array of object values for objects with more properties', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }, { slug: "children's games", description: 'Games suitable for children' }, { slug: 'euro game', description: 'Abstact games that involve little luck' }];
        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck'], ["children's games", 'Games suitable for children'], ['euro game', 'Abstact games that involve little luck']]);
    })
});

describe('createRefObj()', () => {
    test('should return an object', () => {
        const input = [{}];
        expect(createRefObj(input)).not.toBe(input);
    });
    test('Doesnt mutate input array', () => {
        const input = [{
            body: 'I loved this game too',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 17,
            created_at: new Date(1511354613389)
        }, {
            body: 'I loved this game too!',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 16,
            created_at: new Date(1511354613389)
        }]
        createRefObj(input, 'body', 'votes');
        expect(input).toEqual([{
            body: 'I loved this game too',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 17,
            created_at: new Date(1511354613389)
        }, {
            body: 'I loved this game too!',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 16,
            created_at: new Date(1511354613389)
        }]);
    })
    test('should return a reference object from an array of objects', () => {
        const input = [{
            body: 'I loved this game too',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 17,
            created_at: new Date(1511354613389)
        }, {
            body: 'I loved this game too!',
            belongs_to: 'Jenga',
            created_by: 'bainesface',
            votes: 16,
            created_at: new Date(1511354613389)
        }]
        expect(createRefObj(input, 'body', 'votes')).toEqual({ 'I loved this game too': 17, 'I loved this game too!': 16 });
    });
})

describe('updateObjPropertyFromRef', () => {
    test('Does not mutate inputs', () => {
        const input = [{
            body: 'My dog loved this game too!',
            belongs_to: 'Ultimate Werewolf',
            created_by: 'mallionaire',
            votes: 13,
            created_at: new Date(1610964545410)
        }];
        const inputRef = { 'Ultimate Werewolf': 56, 'Something else': 10 };
        updateObjectPropertyFromRef(input, inputRef, 'belongs_to', 'review_id')
        expect(input).toEqual([{
            body: 'My dog loved this game too!',
            belongs_to: 'Ultimate Werewolf',
            created_by: 'mallionaire',
            votes: 13,
            created_at: new Date(1610964545410)
        }]);
        expect(inputRef).toEqual({ 'Ultimate Werewolf': 56, 'Something else': 10 })

    })
    test('should create new property and take value from refObj and delete old property', () => {
        const input = [{
            body: 'My dog loved this game too!',
            belongs_to: 'Ultimate Werewolf',
            created_by: 'mallionaire',
            votes: 13,
            created_at: new Date(1610964545410)
        }, {
            body: "I didn't know dogs could play games",
            belongs_to: 'Ultimate Werewolf',
            created_by: 'philippaclaire9',
            votes: 10,
            created_at: new Date(1610964588110)
        }]
        const expectedOutput = [{
            body: 'My dog loved this game too!',
            created_by: 'mallionaire',
            votes: 13,
            created_at: new Date(1610964545410),
            review_id: 56

        }, {
            body: "I didn't know dogs could play games",
            created_by: 'philippaclaire9',
            votes: 10,
            created_at: new Date(1610964588110),
            review_id: 56
        }]
        const refObj = { 'Ultimate Werewolf': 56, 'Something else': 10 }
        expect(updateObjectPropertyFromRef(input, refObj, 'belongs_to', 'review_id')).toEqual(expectedOutput);
    })
})
