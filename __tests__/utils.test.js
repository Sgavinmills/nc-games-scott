const formatData = require('../db/utils/data-manipulation.js');

describe('formatData()', () => {
    test('Returns new array', () => {
        const input = [{}];
        expect(formatData(input)).not.ToBe(input);
        expect(Array.isArray(formatData(input)));
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
        
    })

})