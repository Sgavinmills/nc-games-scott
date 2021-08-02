const { formatData, createRefObj} = require('../db/utils/data-manipulation.js');

describe('formatData()', () => {
    test('Returns new array', () => {
        const input = [{}];
        console.log(formatData(input), '<-- output')
        expect(formatData(input)).not.toBe(input);
        expect(Array.isArray(formatData(input)));
    })
    test('Returns nested array of object values for single object', () => {
        console.log
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }]
        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck']])
    })
    test('Returns nested array of object values for multiple objects', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }, { slug: "children's games", description: 'Games suitable for children' }]
        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck'], [`children's games`, `Games suitable for children`]])
    })
    test('Returns nested array of object values for objects with more properties', () => {
        const input = [{ slug: 'euro game', description: 'Abstact games that involve little luck' }, { slug: "children's games", description: 'Games suitable for children' },{ slug: 'euro game', description: 'Abstact games that involve little luck' }];

        expect(formatData(input)).toEqual([['euro game', 'Abstact games that involve little luck'], ["children's games", 'Games suitable for children'], ['euro game', 'Abstact games that involve little luck']]);
    })

});

describe('create reference object', () => {
    test('should return an object', () => {
        const input = [{}];
        expect(createRefObj(input )).not.toBe(input);
    });
    test('should return a reference object made up of an array of objects', () => {
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
          expect(createRefObj(input, 'body', 'votes')).toEqual({'I loved this game too': 17, 'I loved this game too!': 16});
    });
})
