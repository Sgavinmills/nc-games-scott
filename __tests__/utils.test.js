const { formatData } = require('../db/utils/data-manipulation.js');

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