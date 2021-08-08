const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const request = require('supertest');
const app = require('../app.js');
const JSONEndPointsFile = require('../endpointlist.json');
const { createRefObj } = require('../db/utils/data-manipulation.js');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api', () => {
    test('status 200 - returns a JSON describing all available endpoints', async () => {
        const response = await request(app).get('/api').expect(200);
        //console.log(JSON.parse(response.body));
        //expect(response.body).toEqual({ message: 'All OK - now try a proper route' });
        expect(response.body.endpoints).toEqual(JSONEndPointsFile);
    })
})

describe('GET /api/an-invalid-route', () => {
    test('status 404 - returns route not found message', async () => {
        const response = await request(app).get('/NOPE').expect(404);
        expect(response.body.message).toEqual('Route not found');
    })
})

describe('GET api/categories', () => {
    test('status 200 - returns list of categories as an array', async () => {
        const response = await request(app).get('/api/categories').expect(200);
        expect(response.body.categories).toHaveLength(4);
        expect(response.body.categories).toBeInstanceOf(Array);
        response.body.categories.forEach(category => {
            expect(category).toEqual(expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String)
            }));
        })
    })
})

describe('GET api/reviews/:review_id', () => {
    test('status 200 - returns review object', async () => {
        const response = await request(app).get('/api/reviews/2').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 2,
            designer: 'Leslie Scott',
            title: 'Jenga',
            owner: 'philippaclaire9',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Fiddly fun for all the family',
            category: 'dexterity',
            created_at: '2021-01-18T10:01:41.251Z',
            votes: 5,
            comment_count: '3'
        })
    })
    test('status 200 - returns review that has no comments attached', async () => {
        const response = await request(app).get('/api/reviews/1').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Farmyard fun!',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 1,
            comment_count: '0'
        })
    })

    //allowing searching by title now so this test is not required
    // test('status 400 - invalid id passed', async () => {
    //     const response = await request(app).get('/api/reviews/NAME').expect(400);
    //     expect(response.body.message).toBe('Invalid data type');
    // })

    test('status 404 - non-existent id passed', async () => {
        const response = await request(app).get('/api/reviews/9999').expect(404);
        expect(response.body.message).toBe('9999 not found');
    })

})

describe('PATCH api/reviews/:review_id', () => {
    test('status 200 - positive increase of votes', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: 2 }).expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Farmyard fun!',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 3,
        })

    })
    test('status 200 - decreases votes for negative number', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: -1 }).expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Farmyard fun!',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 0,
        })

    })
    test('status 200 - sets votes to zero if number larger than current number', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: -3 }).expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Farmyard fun!',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 0,
        })

    })

    test('status 400 - Invalid inc_votes value', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: 'NOPE' }).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - No inc_votes value on request body', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ nothere: 'noo' }).expect(400);
        expect(response.body.message).toBe('no required properties provided');
    })
    test('status 200 - Additional propertys on request body', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: 2, more: 'no' }).expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Farmyard fun!',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 3,
        })
    })
    test('status 400 - invalid ID type', async () => {
        const response = await request(app).patch('/api/reviews/NAME').send({ inc_votes: 2 }).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 404 - ID does not exist', async () => {
        const response = await request(app).patch('/api/reviews/9999').send({ inc_votes: 2 }).expect(404);
        expect(response.body.message).toBe('9999 not found');
    })
    test('status 400 - inc_votes cannot be null', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')

    })
})

describe('GET api/reviews', () => {
    test('status 200 - returns an array of review objects', async () => {
        const response = await request(app).get('/api/reviews').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: expect.any(String),
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String)
            }))
            if (review.review_id === 1)
                expect(review.comment_count).toBe('0');
            if (review.review_id === 3)
                expect(review.comment_count).toBe('3');

        })
    })
    test('status 200 - orders results by date by default', async () => {
        const response = await request(app).get('/api/reviews').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending: true });
    })
    test('status 200 - ?sort_by=owner', async () => {
        const response = await request(app).get('/api/reviews?sort_by=owner').expect(200);
        expect(response.body.reviews).toBeSortedBy('owner', { descending: true });
    })
    test('status 200 - ?sort_by=title', async () => {
        const response = await request(app).get('/api/reviews?sort_by=title').expect(200);
        expect(response.body.reviews).toBeSortedBy('title', { descending: true });
    })
    test('status 200 - ?sort_by=review_id', async () => {
        const response = await request(app).get('/api/reviews?sort_by=review_id').expect(200);
        expect(response.body.reviews).toBeSortedBy('review_id', { descending: true });
    })
    test('status 200 - ?sort_by=category', async () => {
        const response = await request(app).get('/api/reviews?sort_by=category').expect(200);
        expect(response.body.reviews).toBeSortedBy('category', { descending: true });
    })
    test('status 200 - ?sort_by=comment_count', async () => {
        const response = await request(app).get('/api/reviews?sort_by=comment_count').expect(200);
        expect(response.body.reviews).toBeSortedBy('comment_count', { descending: true });
    })
    test('status 200 - ?sort_by=votes', async () => {
        const response = await request(app).get('/api/reviews?sort_by=votes').expect(200);
        expect(response.body.reviews).toBeSortedBy('votes', { descending: true });
    })
    test('status 200 - ?sort_by=created_at', async () => {
        const response = await request(app).get('/api/reviews?sort_by=created_at').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending: true });
    })

    test('status 200 - ?order=asc changes order direction', async () => {
        const response = await request(app).get('/api/reviews?order=asc').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: expect.any(String),
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String)
            }))
            if (review.review_id === 1)
                expect(review.comment_count).toBe('0');
            if (review.review_id === 3)
                expect(review.comment_count).toBe('3');
        })
        expect(response.body.reviews).toBeSortedBy('created_at');

    })
    test('status 200 - ?sort_by=comment_count?order=asc', async () => {
        const response = await request(app).get('/api/reviews?sort_by=comment_count&order=asc').expect(200);
        expect(response.body.reviews).toBeSortedBy('comment_count');
    })
    test('status 200 - ?sort_by=title?order=asc', async () => {
        const response = await request(app).get('/api/reviews?sort_by=title&order=asc').expect(200);
        expect(response.body.reviews).toBeSortedBy('title');
    })
    test('status 200 - ?sort_by=review_id?order=asc', async () => {
        const response = await request(app).get('/api/reviews?sort_by=review_id&order=asc').expect(200);
        expect(response.body.reviews).toBeSortedBy('review_id');
    })
    test('status 200 - ?sort_by=comment_count?order=desc', async () => {
        const response = await request(app).get('/api/reviews?sort_by=comment_count&order=desc').expect(200);
        expect(response.body.reviews).toBeSortedBy('comment_count', { descending: true });
    })

    test('status 200 - ?category=CATTY allows sorting by specified category', async () => {
        const response = await request(app).get('/api/reviews?category=dexterity').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(1);
        expect(response.body.reviews).toEqual([{
            review_id: 2,
            title: 'Jenga',
            owner: 'philippaclaire9',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            category: 'dexterity',
            created_at: '2021-01-18T10:01:41.251Z',
            votes: 5,
            comment_count: '3'
        }])


    })
    test('status 200 - ?category=CATTY allows sorting by specified category', async () => {
        const response = await request(app).get('/api/reviews?category=social deduction').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
    })

    test('status 200 - All 3 querys work together', async () => {
        const response = await request(app).get('/api/reviews?category=social deduction&sort_by=comment_count&order=asc').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
        expect(response.body.reviews).toBeSortedBy('comment_count');
    })

    test('status 400 - Invalid sort_by query - column does not exist or is not allowed', async () => {
        const response = await request(app).get('/api/reviews?sort_by=NOPE').expect(400);
        expect(response.body.message).toBe('Invalid query: NOPE')
    })
    test('status 200 - Invalid order query defaults to default (desc)', async () => {
        const response = await request(app).get('/api/reviews?order=NOPE').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending: true });
        expect(response.body.reviews).toHaveLength(10);
    })
    test('status 404 - Category query is not in database', async () => {
        const response = await request(app).get('/api/reviews?category=NOPE').expect(404);
        expect(response.body.message).toBe('NOPE not found')
    })
    test('staus 200 - Category exists but has no reviews associated', async () => {
        const response = await request(app).get(`/api/reviews?category=children's games`).expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(0);

    })


})

describe('GET /api/reviews/:review_id/comments', () => {
    test('status 200 - Responds with array of comments for given review_id', async () => {
        const response = await request(app).get('/api/reviews/2/comments').expect(200);
        expect(response.body.comments).toBeInstanceOf(Array);
        expect(response.body.comments).toHaveLength(3);
        response.body.comments.forEach(comment => {
            expect(comment).toEqual(expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String)
            }))
        })
    })

    test('status 400 - Invalid review_id data type', async () => {
        const response = await request(app).get('/api/reviews/NOPE/comments').expect(400);
        expect(response.body.message).toBe('Invalid data type')
    })
    test('status 404 - review_id is valid but does not exists', async () => {
        const response = await request(app).get('/api/reviews/9999/comments').expect(404);
        expect(response.body.message).toBe('9999 not found')
    })
    test('status 200 - Valid review_id but no comments attached', async () => {
        const response = await request(app).get('/api/reviews/1/comments').expect(200);
        expect(response.body.comments).toBeInstanceOf(Array);
        expect(response.body.comments).toHaveLength(0);
    })

})

describe('POST /api/reviews/:review_id/comments', () => {
    test('status 201 - creates a new comment on review_id ', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: 'mallionaire', body: 'This review is a waste of time' }).expect(201);
        expect(response.body.comments).toBeInstanceOf(Object);
        expect(response.body.comments).toEqual({
            author: 'mallionaire',
            body: 'This review is a waste of time',
            comment_id: 7,
            votes: 0,
            created_at: expect.any(String),
            review_id: 1
        })
    })

    test('status 400 - Invalid review ID', async () => {
        const response = await request(app).post('/api/reviews/NOPE/comments').send({ username: 'mallionaire', body: 'This review is a waste of time' }).expect(400);
        expect(response.body.message).toBe('Invalid data type')
    })
    test('status 404 - review_id valid but doesnt exist', async () => {
        const response = await request(app).post('/api/reviews/9999/comments').send({ username: 'mallionaire', body: 'This review is a waste of time' }).expect(404);
        expect(response.body.message).toBe(`One of your values is required to already exist in the database but could not be found`)
    })
    test('status 400 - Extra properties provided', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ something: 'else', username: 'mallionaire', body: 'This review is a waste of time' }).expect(400);
        expect(response.body.message).toBe('Too many properties provided')
    })
    test('status 400 - Missing required property username', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ body: 'This review is a waste of time' }).expect(400);
        expect(response.body.message).toBe('username property required')
    })
    test('status 400 - Missing required property body', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: 'mallionaire' }).expect(400);
        expect(response.body.message).toBe('body property required')
    })
    test('status 404 - Username doesnt exist', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: 'King', body: 'This review is a waste of time' }).expect(404);
        expect(response.body.message).toBe(`One of your values is required to already exist in the database but could not be found`)
    })
    test('status 400 - Body is too long', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: 'mallionaire', body: 'x'.repeat(2001) }).expect(400);
        expect(response.body.message).toBe('Value too long')
    })
    test('status 400 - Null body provided', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: 'mallionaire', body: null }).expect(400);
        expect(response.body.message).toBe(`Null value not allowed`)

    })
    test('status 400 - Null username provided', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({ username: null, body: 'This review is a waste of time' }).expect(400);
        expect(response.body.message).toBe(`Null value not allowed`)

    })

})


describe('DELETE /api/comments/:comment_id', () => {
    test('status 204 - deletes comment by id', async () => {
        const dbQryBefore = await db.query('SELECT * FROM comments WHERE comment_id = 1');
        expect(dbQryBefore.rows).toHaveLength(1);
        const response = await request(app).delete('/api/comments/1').expect(204);
        const dbQryAfter = await db.query('SELECT * FROM comments WHERE comment_id = 1');
        expect(dbQryAfter.rows).toHaveLength(0);
    })
    test('status 400 - Invalid comment_id', async () => {
        const response = await request(app).delete('/api/comments/NOPE').expect(400);
        expect(response.body.message).toBe('Invalid data type')
    })
    test('status 404 - Valid but non-existent comment_id', async () => {
        const response = await request(app).delete('/api/comments/9999').expect(404);
        expect(response.body.message).toBe('9999 does not exist')
    })

})

describe('GET /api/users', () => {
    test('status 200 - responds with array of user objects', async () => {
        const response = await request(app).get('/api/users').expect(200);
        expect(response.body.users).toHaveLength(4);
        expect(response.body.users).toEqual([
            { username: 'mallionaire' },
            { username: 'philippaclaire9' },
            { username: 'bainesface' },
            { username: 'dav3rid' }
        ])
    })
})

describe('GET /api/users/:username', () => {
    test('status 200 - responds with a user object', async () => {
        const response = await request(app).get('/api/users/mallionaire').expect(200);
        expect(response.body.users).toBeInstanceOf(Object);
        expect(response.body.users).toEqual({
            username: 'mallionaire',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'haz'
        })

    })

    test('status 404 - Username provided that doesnt exist', async () => {
        const response = await request(app).get('/api/users/Scott').expect(404);
        expect(response.body.message).toBe('Scott not found');
    })

})

describe('PATCH /api/comments/:comment_id', () => {
    test('status 200 - responds with updated comment', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: 5 }).expect(200);
        expect(response.body.comments).toBeInstanceOf(Object);
        expect(response.body.comments).toEqual({
            comment_id: 1,
            author: 'bainesface',
            review_id: 2,
            votes: 21,
            created_at: '2017-11-22T12:43:33.389Z',
            body: 'I loved this game too!'
        })
    })
    test('status 200 - negative votes dont go below 0', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: -50 }).expect(200);
        expect(response.body.comments).toBeInstanceOf(Object);
        expect(response.body.comments).toEqual({
            comment_id: 1,
            author: 'bainesface',
            review_id: 2,
            votes: 0,
            created_at: '2017-11-22T12:43:33.389Z',
            body: 'I loved this game too!'
        })
    })

    test('status 400 - Invalid coment_id data type', async () => {
        const response = await request(app).patch('/api/comments/NOPE').send({ inc_votes: 10 }).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 404 - Valid but non-existent commen_id', async () => {
        const response = await request(app).patch('/api/comments/9999').send({ inc_votes: 10 }).expect(404);
        expect(response.body.message).toBe('9999 not found');
    })
    test('status 400 - Missing inc_votes property', async () => {
        const response = await request(app).patch('/api/comments/1').send({}).expect(400);
        expect(response.body.message).toBe('no required properties provided');
    })
    test('status 400 - Additional properties sent', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: 10, something: 'else' }).expect(400);
        expect(response.body.message).toBe('Too many properties provided');
    })
    test('status 400 - inc_votes provided with invalid data type', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: 'nope' }).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - inc_votes cannot be null', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')

    })

})

describe('GET /api/reviews Pagination', () => {
    test('status 200 - reviews results allows limit query', async () => {
        const response = await request(app).get('/api/reviews?limit=11').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(11);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner: expect.any(String),
                title: expect.any(String),
                review_id: expect.any(Number),
                category: expect.any(String),
                review_img_url: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(String)
            }))
        })
    })
    test('status 200 - adds a total review count to response', async () => {
        const response = await request(app).get('/api/reviews?limit=11').expect(200);
        expect(response.body.total_count).toBe(13);
    })
    test('status 200 - total review count is only total number of results that fit query', async () => {
        const response = await request(app).get('/api/reviews?category=social deduction&limit=4').expect(200);
        expect(response.body.total_count).toBe(11);
        expect(response.body.reviews).toHaveLength(4);

    })
    //no need to test for defaults as all the previous tests still pass (after changing all the array lenghts to 10)
    test('status 200 - reviews results allows "p" page query', async () => {
        const response = await request(app).get('/api/reviews?p=2&sort_by=review_id&order=asc').expect(200);
        expect(response.body.reviews).toHaveLength(3);
        expect(response.body.reviews[0].review_id).toBe(11);
    })
    test('status 400 - invalid limit data type', async () => {
        const response = await request(app).get('/api/reviews?limit=NOPE').expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - invalid p data type', async () => {
        const response = await request(app).get('/api/reviews?p=NOPE').expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - negative page number', async () => {
        const response = await request(app).get('/api/reviews?p=-1').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0');
    })
    test('status 400 - negative limit number', async () => {
        const response = await request(app).get('/api/reviews?limit=-1').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0');
    })
    test('status 400 - 0 page number', async () => {
        const response = await request(app).get('/api/reviews?p=0').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0')

    })

})

describe('GET /api/reviews/:review_id/comments Pagination', () => {
    test('status 200 - allows limit query', async () => {
        const response = await request(app).get('/api/reviews/2/comments?limit=2').expect(200);
        expect(response.body.comments).toHaveLength(2);
        expect(response.body.comments).toEqual([{
            comment_id: 1,
            votes: 16,
            created_at: '2017-11-22T12:43:33.389Z',
            author: 'bainesface',
            body: 'I loved this game too!'
        },
        {
            comment_id: 4,
            votes: 16,
            created_at: '2017-11-22T12:36:03.389Z',
            author: 'bainesface',
            body: 'EPIC board game!'
        }]);
    })
    test('status 200 - adds a total comment count to response', async () => {
        const response = await request(app).get('/api/reviews/2/comments?limit=2').expect(200);
        expect(response.body.total_count).toBe(3);
        expect(response.body.comments).toHaveLength(2);

    })
    test('status 200 - comments results allows "p" page query', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=2&limit=2').expect(200);
        expect(response.body.comments).toHaveLength(1);
        expect(response.body.comments).toEqual([{
            comment_id: 5,
            votes: 13,
            created_at: '2021-01-18T10:24:05.410Z',
            author: 'mallionaire',
            body: 'Now this is a story all about how, board games turned my life upside down'
        }]);
    })
    test('status 400 - invalid limit data type', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=2&limit=NOPE').expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - invalid p data type', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=NOPE&limit=2').expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 400 - negative page number', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=-1&limit=2').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0');
    })
    test('status 400 - negative limit number', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=2&limit=-2').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0');
    })
    test('status 400 - 0 page number', async () => {
        const response = await request(app).get('/api/reviews/2/comments?p=0&limit=2').expect(400);
        expect(response.body.message).toBe('Limit and page must be greater than 0');
    })
})

describe('POST /api/reviews', () => {
    test('status 201 - Creates a new review', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(201);
        expect(response.body.reviews).toBeInstanceOf(Object);
        expect(response.body.reviews).toEqual({
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0
        })
        let createdAtTime = new Date(response.body.reviews.created_at).getTime();
        let secondAgo = new Date().getTime() - 1000;
        expect(createdAtTime).toBeGreaterThan(secondAgo);

    })
    test('status 200 - allows an optional review_img_url property to be provided', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(201);
        expect(response.body.reviews).toEqual({
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
            review_img_url: 'www.yep.com'
        })
    })
    test('status 404 - Valid but non-existent username', async () => {
        const postSend = {
            owner: 'Scotty',
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(404);
        expect(response.body.message).toBe('One of your values is required to already exist in the database but could not be found');

    })
    test('status 400 - Title too long', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly'.repeat(100),
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 400 - Review body too long', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'd'.repeat(5001),
            designer: 'Hasbrooo',
            category: 'dexterity',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 400 - Designer too long', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'd'.repeat(5001),
            designer: 'H'.repeat(101),
            category: 'dexterity',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 404 - One of your values is required to already exist in the database but could not be found', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Reeeevviieww Body',
            designer: 'Hasbro',
            category: 'made up category',
            review_img_url: 'www.yep.com'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(404);
        expect(response.body.message).toBe('One of your values is required to already exist in the database but could not be found');
    })
    test('status 400 - Missing owner property', async () => {
        const postSend = {
            title: 'Monopoly',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('owner property required');

    })
    test('status 400 - Missing title property', async () => {
        const postSend = {
            owner: 'mallionaire',
            review_body: 'Do not play after drinks on christmas day',
            designer: 'Hasbrooo',
            category: 'dexterity'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('title property required');

    })
    test('status 400 - Missing review_body property', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            designer: 'Hasbrooo',
            category: 'dexterity'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('review_body property required');

    })
    test('status 400 - Missing designer property', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Hasbrooo',
            category: 'dexterity'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('designer property required');

    })
    test('status 400 - Missing category property', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Hasbrooo',
            designer: 'Hasbro'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('category property required');

    })

    test('status 400 - Too many properties provided', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Hasbrooo',
            designer: 'Hasbro',
            category: 'dexterity',
            something: 'else'
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Too many properties provided');
    })
    test('status 400 - owner cannot be null', async () => {
        const postSend = {
            owner: null,
            title: 'Monopoly',
            review_body: 'Hasbrooo',
            designer: 'Hasbro',
            category: 'dexterity',
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })
    test('status 400 - title cannot be null', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: null,
            review_body: 'Hasbrooo',
            designer: 'Hasbro',
            category: 'dexterity',
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })
    test('status 400 - review_body cannot be null', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: null,
            designer: 'Hasbro',
            category: 'dexterity',
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })
    test('status 400 - category cannot be null', async () => {
        const postSend = {
            owner: 'mallionaire',
            title: 'Monopoly',
            review_body: 'Hasbrooo',
            designer: 'Hasbro',
            category: null,
        }
        const response = await request(app).post('/api/reviews').send(postSend).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })



})

describe('POST api/categories', () => {
    test('status 201 - Creates new category', async () => {
        const response = await request(app).post('/api/categories').send({ slug: "Role playing", description: 'Dungeons n dragons etc' }).expect(201);
        expect(response.body.categories).toEqual({
            slug: "Role playing",
            description: 'Dungeons n dragons etc'
        })
    })
    test('status 400 - Slug value too long', async () => {
        const response = await request(app).post('/api/categories').send({ slug: "R".repeat(201), description: 'Dungeons n dragons etc' }).expect(400);
        expect(response.body.message).toBe('Value too long');

    })
    test('status 400 - Description value too long', async () => {
        const response = await request(app).post('/api/categories').send({ slug: "Roaar", description: 'D'.repeat(501) }).expect(400);
        expect(response.body.message).toBe('Value too long');

    })
    test('status 400 - Slug property missing', async () => {
        const response = await request(app).post('/api/categories').send({ description: 'Dungeons n dragons etc' }).expect(400);
        expect(response.body.message).toBe('slug property required');

    })
    test('status 400 - Description property missing', async () => {
        const response = await request(app).post('/api/categories').send({ slug: 'Dungeons n dragons etc' }).expect(400);
        expect(response.body.message).toBe('description property required');

    })
    test('status 400 - Too many properties provided', async () => {
        const response = await request(app).post('/api/categories').send({ slug: 'Dungeons n dragons etc', description: 'a description', something: 'else' }).expect(400);
        expect(response.body.message).toBe('Too many properties provided');
    })
    test('status 400 - slug cannot be null', async () => {
        const response = await request(app).post('/api/categories').send({ slug: null, description: 'a description' }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })
    test('status 400 - description cannot be null', async () => {
        const response = await request(app).post('/api/categories').send({ slug: 'SLug name', description: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')
    })





})

describe('DELETE /api/reviews/:review_id', () => {
    test('status 204 - deletes review by id', async () => {
        const dbQryBefore = await db.query('SELECT * FROM reviews WHERE review_id = 2');
        expect(dbQryBefore.rows).toHaveLength(1);
        const response = await request(app).delete('/api/reviews/2').expect(204);
        const dbQryAfter = await db.query('SELECT * FROM reviews WHERE review_id = 2');
        expect(dbQryAfter.rows).toHaveLength(0);
    })
    test('status 400 - Invalid review_id', async () => {
        const response = await request(app).delete('/api/reviews/NOPE').expect(400);
        expect(response.body.message).toBe('Invalid data type')
    })
    test('status 404 - Valid but non-existent review_id', async () => {
        const response = await request(app).delete('/api/reviews/8888').expect(404);
        expect(response.body.message).toBe('8888 does not exist')
    })
    test('status 204 - corresponding comments also deleted', async () => {
        const dbQryBefore = await db.query('SELECT * FROM comments WHERE comment_id = 1')
        expect(dbQryBefore.rows).toHaveLength(1);
        const response = await request(app).delete('/api/reviews/2').expect(204);
        const dbQryAfter = await db.query('SELECT * FROM comments WHERE comment_id = 1')
        expect(dbQryAfter.rows).toHaveLength(0);

    })

})

describe('PATCH /api/reviews/:review_id', () => {
    test('status 200 - Edit a review body', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ review_body: "This is a new body" }).expect(200);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'This is a new body',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 1
        })
        const dbQry = await db.query('SELECT * FROM reviews WHERE review_id=1');
        expect(dbQry.rows[0].review_body).toEqual('This is a new body');
    })
    test('status 200 - Body and votes can be changed in one query', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ review_body: "This is a new body", inc_votes: 1 }).expect(200);
        expect(response.body.reviews).toEqual({
            review_id: 1,
            title: 'Agricola',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'This is a new body',
            category: 'euro game',
            created_at: '2021-01-18T10:00:20.514Z',
            votes: 2
        })
        const dbQry = await db.query('SELECT * FROM reviews WHERE review_id=1');
        expect(dbQry.rows[0].review_body).toEqual('This is a new body');
        expect(dbQry.rows[0].votes).toEqual(2);


    })

    test('status 400 - Body value too big', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ review_body: "T".repeat(5001) }).expect(400);
        expect(response.body.message).toBe('Value too long')

    })
    test('status 400 - Invalid review id', async () => {
        const response = await request(app).patch('/api/reviews/NOPE').send({ review_body: "Tryant" }).expect(400);
        expect(response.body.message).toBe('Invalid data type')

    })
    test('status 404 - Review id valid but does not exist', async () => {
        const response = await request(app).patch('/api/reviews/9999').send({ review_body: "Tryant" }).expect(404);
        expect(response.body.message).toBe('9999 not found')

    })

    test('status 400 - review_body cannot be null', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ review_body: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')

    })

})

describe('PATCH /api/comments/:comment_id', () => {
    test('status 200 - Edit a comment body', async () => {
        const response = await request(app).patch('/api/comments/1').send({ body: "This is a new comment body" }).expect(200);
        expect(response.body.comments).toEqual({
            comment_id: 1,
            author: "bainesface",
            review_id: 2,
            votes: 16,
            created_at: "2017-11-22T12:43:33.389Z",
            body: "This is a new comment body"
        })
        const dbQry = await db.query('SELECT * FROM comments WHERE comment_id=1');
        expect(dbQry.rows[0].body).toEqual('This is a new comment body');
    })
    test('status 200 - Body and votes can be changed in one query', async () => {
        const response = await request(app).patch('/api/comments/1').send({ body: "This is a new comment body", inc_votes: 10 }).expect(200);
        expect(response.body.comments).toEqual({
            comment_id: 1,
            author: "bainesface",
            review_id: 2,
            votes: 26,
            created_at: "2017-11-22T12:43:33.389Z",
            body: "This is a new comment body"
        })
        const dbQry = await db.query('SELECT * FROM comments WHERE comment_id=1');
        expect(dbQry.rows[0].body).toEqual('This is a new comment body');
        expect(dbQry.rows[0].votes).toEqual(26);
    })
    test('status 400 - Body value too big', async () => {
        const response = await request(app).patch('/api/comments/1').send({ body: "T".repeat(5001) }).expect(400);
        expect(response.body.message).toBe('Value too long')

    })
    test('status 400 - Invalid comment id', async () => {
        const response = await request(app).patch('/api/comments/NOPE').send({ body: "Tryant" }).expect(400);
        expect(response.body.message).toBe('Invalid data type')

    })
    test('status 404 - Comment id valid but does not exist', async () => {
        const response = await request(app).patch('/api/comments/9999').send({ body: "Tryant" }).expect(404);
        expect(response.body.message).toBe('9999 not found')

    })
    test('status 400 - body cannot be null', async () => {
        const response = await request(app).patch('/api/comments/1').send({ body: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed')

    })

})

describe('PATCH /api/users/:username', () => {
    test('status 200 - Allows editting of a user profile', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ avatar_url: "www.newpiclink", name: "King" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'mallionaire',
            avatar_url: 'www.newpiclink',
            name: 'King'
        })
        const dbQryResponse = await db.query(`SELECT * FROM users WHERE username = 'mallionaire'`);
        expect(dbQryResponse.rows[0].avatar_url).toBe('www.newpiclink');
        expect(dbQryResponse.rows[0].name).toBe('King');
    })
    test('status 200 - Updated username is reflected in other tables', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ avatar_url: "www.newpiclink", name: "King", username: "Scotopher" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'Scotopher',
            avatar_url: 'www.newpiclink',
            name: 'King'
        })
        const dbQryResponse = await db.query(`SELECT * FROM users WHERE username = 'Scotopher'`);
        expect(dbQryResponse.rows[0].avatar_url).toBe('www.newpiclink');
        expect(dbQryResponse.rows[0].name).toBe('King');
        const dbQryResponse2 = await db.query(`SELECT * FROM users WHERE username = 'mallionaire'`);
        expect(dbQryResponse2.rows).toHaveLength(0);
        const dbQryResponse3 = await db.query(`SELECT * FROM reviews WHERE review_id=1`);
        expect(dbQryResponse3.rows[0].owner).toBe('Scotopher');
        const dbQryResponse4 = await db.query(`SELECT * FROM comments WHERE comment_id=2`);
        expect(dbQryResponse4.rows[0].author).toBe('Scotopher');

    })
    test('status 200 - Can update just username', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: "Scotopher" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'Scotopher',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'haz'
        })
    })
    test('status 200 - Can update just avatar_url', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ avatar_url: "www.newpiclink" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'mallionaire',
            avatar_url: 'www.newpiclink',
            name: 'haz'
        })
    })
    test('status 200 - Can update just name', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ name: "Rosalind" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'mallionaire',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'Rosalind'
        })
    })
    test('status 200 - Can update username and 1 other property', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: 'King', name: "Rosalind" }).expect(200);
        expect(response.body.users).toEqual({
            username: 'King',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'Rosalind'
        })
    })

    test('status 400 - Does not allow null properties - username', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: null, name: "Rosalind" }).expect(400);
        expect(response.body.message).toBe('Null value not allowed');
    })
    test('status 400 - Does not allow null properties - name', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: 'mallionaire', name: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed');
    })
    test('status 400 - Does not allow null properties - avatar_url', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: 'mallionaire', avatar_url: null }).expect(400);
        expect(response.body.message).toBe('Null value not allowed');
    })
    test('status 400 - Extra properties provided', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: 'mallionaire', extra: 'property' }).expect(400);
        expect(response.body.message).toBe('Too many properties provided')

    })
    test('status 400 - No required properties provided', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({}).expect(400);
        expect(response.body.message).toBe('no required properties provided')

    })
    test('status 400 - avatar_url value too big', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ avatar_url: "T".repeat(2001) }).expect(400);
        expect(response.body.message).toBe('Value too long')

    })
    test('status 400 - username value too big', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: "T".repeat(201) }).expect(400);
        expect(response.body.message).toBe('Value too long')

    })
    test('status 400 - name value too big', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ name: "T".repeat(201) }).expect(400);
        expect(response.body.message).toBe('Value too long')
    })
    test('status 404 - Username param does not exist', async () => {
        const response = await request(app).patch('/api/users/TheKing').send({ name: "Tryant" }).expect(404);
        expect(response.body.message).toBe('TheKing not found')
    })
    test('status 404 - New username is not unique', async () => {
        const response = await request(app).patch('/api/users/mallionaire').send({ username: "bainesface" }).expect(400);
        expect(response.body.message).toBe(`A property has failed its requirement to be unique`)
    })
})
describe('GET /api/reviews/:title', () => {
    test('status 200 - Returns array of reviews with specified title', async () => {
        const response = await request(app).get('/api/reviews/Jenga').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews[0]).toEqual({
            review_id: 2,
            designer: 'Leslie Scott',
            title: 'Jenga',
            owner: 'philippaclaire9',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Fiddly fun for all the family',
            category: 'dexterity',
            created_at: '2021-01-18T10:01:41.251Z',
            votes: 5,
            comment_count: '3'
        })
    })
    test('status 200 - Works when multiple reviews have same title', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
                                            (title, review_body, designer, category, owner, review_img_url)
                                            VALUES
                                            ('Jenga', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
                                            `)
        const response = await request(app).get('/api/reviews/Jenga').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(2);
        expect(response.body.reviews).toEqual([{
            review_id: 2,
            designer: 'Leslie Scott',
            title: 'Jenga',
            owner: 'philippaclaire9',
            review_img_url:
                'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            review_body: 'Fiddly fun for all the family',
            category: 'dexterity',
            created_at: '2021-01-18T10:01:41.251Z',
            votes: 5,
            comment_count: '3'
        }, {
            review_id: 14,
            title: 'Jenga',
            review_body: 'an inserted review',
            designer: 'scott',
            review_img_url: 'www.test.com',
            votes: 0,
            category: 'dexterity',
            owner: 'mallionaire',
            created_at: expect.any(String),
            comment_count: '0'
        }])
    })
    test('status 404 - Title does not exist', async () => {
        const response = await request(app).get('/api/reviews/NOPE').expect(404);
        expect(response.body.message).toBe('NOPE not found');
    })

    test('status 200 - Titles with numbers at the start are treated as titles (not review_id)', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
                                            (title, review_body, designer, category, owner, review_img_url)
                                            VALUES
                                            ('66Name', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
                                            `)
        const response = await request(app).get('/api/reviews/66Name').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);

    })
    test('status 200 - Titles with numbers at the end are treated as titles (not review_id)', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
        (title, review_body, designer, category, owner, review_img_url)
        VALUES
        ('Name66', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
        `)
        const response = await request(app).get('/api/reviews/Name66').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
    })
    test('status 200 - Titles with numbers in the middle are treated as titles (not review_id)', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
        (title, review_body, designer, category, owner, review_img_url)
        VALUES
        ('N66ame', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
        `)
        const response = await request(app).get('/api/reviews/N66ame').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
    })
    test('status 200 - Titles with numbers at the start and end are treated as titles (not review_id)', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
        (title, review_body, designer, category, owner, review_img_url)
        VALUES
        ('6Name6', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
        RETURNING *;`)
        const response = await request(app).get('/api/reviews/6Name6').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
    })
    test('status 200 - Titles made up completely of numbers are treated as review_id', async () => {
        const qryResponse = await db.query(`INSERT INTO reviews
        (title, review_body, designer, category, owner, review_img_url)
        VALUES
        ('1', 'an inserted review', 'scott', 'dexterity', 'mallionaire', 'www.test.com')
        RETURNING *;`)
        const response = await request(app).get('/api/reviews/1').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Object);

    })
})


describe('POST /api/users', () => {
    test('status 201 - allows creating a new user, responds with newly created user', async () => {
        const postBody = { username: 'Kingly', name: 'Scott', avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(201);
        expect(response.body.users).toBeInstanceOf(Object);
        expect(response.body.users).toEqual({
            username: 'Kingly', name: 'Scott', avatar_url: 'www.testpic.com'
        })
        dbQryResponse = await db.query(`SELECT * FROM users WHERE username = 'Kingly'`)
        expect(dbQryResponse.rows[0].name).toBe('Scott');

    })
    test('status 400 - username too long', async () => {
        const postBody = { username: 'K'.repeat(201), name: 'Scott', avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 400 - name too long', async () => {
        const postBody = { username: 'Kingly', name: 'S'.repeat(201), avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 400 - avatar url too long', async () => {
        const postBody = { username: 'Kingly', name: 'Scott', avatar_url: 'w'.repeat(1001) };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Value too long');
    })
    test('status 400 - missing name property', async () => {
        const postBody = { username: 'Kingly', avatar_url: 'www.testlink' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('name property required');

    })
    test('status 400 - missing username property', async () => {
        const postBody = { name: 'Kingly', avatar_url: 'www.testlink' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('username property required');

    })

    test('status 400 - too many properties provided', async () => {
        const postBody = { name: 'Kingly', avatar_url: 'www.testlink', username: 'SCOTTY', something: 'else' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Too many properties provided');


    })
    test('status 201 - avatar_url is optional', async () => {
        const postBody = { name: 'Kingly', username: 'SCOTTY' };
        const response = await request(app).post('/api/users').send(postBody).expect(201);
        expect(response.body.users).toBeInstanceOf(Object);
        expect(response.body.users).toEqual({
            name: 'Kingly', username: 'SCOTTY', avatar_url: null
        })
    })
    test('status 400 - doesnt accept null username value', async () => {
        const postBody = { name: 'Kingly', username: null, avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Null value not allowed');
    })
    test('status 400 - doesnt accept null name value', async () => {
        const postBody = { username: 'Kingly', name: null, avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('Null value not allowed');
    })
    test('status 400 - username must be unique', async () => {
        const postBody = { username: 'mallionaire', name: 'Scott', avatar_url: 'www.testpic.com' };
        const response = await request(app).post('/api/users').send(postBody).expect(400);
        expect(response.body.message).toBe('A property has failed its requirement to be unique');
    })

})
//serves an array of all reviews a user has voted on 
describe('GET /api/votes/:username/reviews', () => {
    test('status 200 - gets all reviews voted/liked by a user', async () => {
        const response = await request(app).get('/api/votes/mallionaire/reviews').expect(200);
        expect(response.body.reviews).toHaveLength(7);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                review_id: expect.any(Number),
                title: expect.any(String),
                category: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                owner: expect.any(String),

            }))

        })
    })

    test('status 404 - username doesnt exist', async () => {
        const response = await request(app).get('/api/votes/NOPE/reviews').expect(404);
        expect(response.body.message).toBe('NOPE not found');
    })
    test('status - username exists but has not voted on any reviews', async () => {
        const response = await request(app).get('/api/votes/dav3rid/reviews').expect(200);
        expect(response.body.reviews).toHaveLength(0);

    })

})
//serves an array of all comments a user has voted on
describe('GET /api/votes/:username/comments', () => {
    test('status 200 - gets all comments voted/liked by a user', async () => {
        const response = await request(app).get('/api/votes/mallionaire/comments').expect(200);
        expect(response.body.comments).toHaveLength(5);
        response.body.comments.forEach(comment => {
            expect(comment).toEqual(expect.objectContaining({
                comment_id: expect.any(Number),
                created_at: expect.any(String),
                votes: expect.any(Number),
                author: expect.any(String),
                review_title: expect.any(String)
            }))

        })
    })

    test('status 404 - username doesnt exist', async () => {
        const response = await request(app).get('/api/votes/NOPE/comments').expect(404);
        expect(response.body.message).toBe('NOPE not found');
    })
    test('status - username exists but has not voted on any reviews', async () => {
        const response = await request(app).get('/api/votes/dav3rid/comments').expect(200);
        expect(response.body.comments).toHaveLength(0);

    })

})
//serves an array of reviews that a user has commented on 
describe('GET /api/comments/:username/reviews', () => {
    test('status 200 - gets all reviews that user has commented on', async () => {
        const response = await request(app).get('/api/comments/mallionaire/reviews').expect(200);
        expect(response.body.reviews).toHaveLength(2);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                review_id: expect.any(Number),
                title: expect.any(String),
                category: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                owner: expect.any(String),
            }))

        })
    })

    test('status 404 - username doesnt exist', async () => {
        const response = await request(app).get('/api/comments/NOPE/reviews').expect(404);
        expect(response.body.message).toBe('NOPE not found');
    })
    test('status - username exists but has not commented on any reviews', async () => {
        const response = await request(app).get('/api/comments/dav3rid/reviews').expect(200);
        expect(response.body.reviews).toHaveLength(0);

    })
})

//how to insert data into query? new Date(currentTImeLess5mins) not working due to invalid format!?
describe('GET api/reviews', () => {
    test('status 200 - Added ?time=10 query to allow user to select minutes ago', async () => {
        let currentTimeLess5Mins = new Date()-300000;
        let currentTimeLess8mins = new Date()-480000;
        let currentTimeLess12mins = new Date()-720000;
        const response = await request(app).get('/api/reviews?time=10').expect(200);
        expect(response.body.reviews).toHaveLength(0);
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'dexterity')`)
        const response2 = await request(app).get('/api/reviews?time=10').expect(200);
        expect(response2.body.reviews).toHaveLength(1);
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'dexterity')`)
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'dexterity')`)
        const response3 = await request(app).get('/api/reviews?time=10').expect(200);
        expect(response3.body.reviews).toHaveLength(3);
    })
    test('status 200 - Added ?time=10 query works with category query too', async () => {
        let currentTimeLess5Mins = new Date()-300000;
        let currentTimeLess8mins = new Date()-480000;
        let currentTimeLess12mins = new Date()-720000;
        const response = await request(app).get('/api/reviews?time=10&category=dexterity').expect(200);
        expect(response.body.reviews).toHaveLength(0);
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'dexterity')`)
        const response2 = await request(app).get('/api/reviews?time=10&category=dexterity').expect(200);
        expect(response2.body.reviews).toHaveLength(1);
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'euro game')`)
        await db.query(`INSERT INTO reviews (title, owner, review_body, category)
        VALUES ('random title', 'mallionaire', 'a test review body', 'dexterity')`)
        const response3 = await request(app).get('/api/reviews?time=10&category=dexterity').expect(200);
        expect(response3.body.reviews).toHaveLength(2);
    })
    test('status 200 - works for different time limits', async () => {
        //Date of earliest test data review in January
        let testDate = new Date(1610010368077);
        let currentDate = new Date();
        //extra 5 mins to account for any delays
        let minutesAgo = Math.floor((currentDate-testDate)/1000/60) + 5
        const response = await request(app).get(`/api/reviews?time=${minutesAgo}&limit=15`).expect(200);
        expect(response.body.reviews).toHaveLength(11);
        
    })
    test('status 400 - no negative times', async () => {
        const response = await request(app).get('/api/reviews?time=-10').expect(400);
        expect(response.body.message).toBe('time must be a positive integer of minutes')
    })
    test('status 400 - no decimal times', async () => {
        const response = await request(app).get('/api/reviews?time=10.5').expect(400);
        expect(response.body.message).toBe('time must be a positive integer of minutes')
    })
    test('status 400 - no non-integer times', async () => {
        const response = await request(app).get('/api/reviews?time=NOPE').expect(400);
        expect(response.body.message).toBe('time must be a positive integer of minutes')
    })
    test('status 200 - Valid time constraint with no reviews returns empty array', async () => {
        const response = await request(app).get('/api/reviews?time=3').expect(200);
        expect(response.body.reviews).toHaveLength(0);
        expect(response.body.reviews).toBeInstanceOf(Array);

    })
})









    