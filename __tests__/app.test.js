const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const request = require('supertest');
const app = require('../app.js');
const { forEach } = require('../db/data/test-data/categories.js');

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe('GET /api', () => {
    test('status 200 - returns welcome message', async () => {
        const response = await request(app).get('/api').expect(200);
        expect(response.body).toEqual({ message: 'All OK - now try a proper route' });
    })
})

describe('GET an-invalid-route', () => {
    test('status 404 - returns route not found message', async () => {
        const response = await request(app).get('/NOPE').expect(404);
        expect(response.body.message).toEqual('Route not found');
    })
})

describe('GET api/categories', () => {
    test('status 200 - returns list of categories', async () => {
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


    test('status 400 - invalid request', async () => {
        const response = await request(app).get('/api/reviews/NAME').expect(400);
        expect(response.body.message).toBe('Invalid request');
    })
    test('status 404 - not found', async () => {
        const response = await request(app).get('/api/reviews/9999').expect(404);
        expect(response.body.message).toBe('Not found');
    })

})

describe('PATCH api/reviews/:review_id', () => {
    test('status 200 - positive increase of votes', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes : 2 }).expect(200);
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
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes : -1 }).expect(200);
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
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes : -3 }).expect(200);
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
        const response = await request(app).patch('/api/reviews/1').send({inc_votes : 'NOPE'}).expect(400);
        expect(response.body.message).toBe('Invalid request');
    })
    test('status 400 - No inc_votes value on request body', async () => {
        const response = await request(app).patch('/api/reviews/1').send({nothere: 'noo'}).expect(400);
        expect(response.body.message).toBe('Missing data');
    })
    test('status 200 - Additional propertys on request body', async () => {
        const response = await request(app).patch('/api/reviews/1').send({ inc_votes : 2, more : 'no' }).expect(200);
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
        const response = await request(app).patch('/api/reviews/NAME').send({inc_votes : 2}).expect(400);
        expect(response.body.message).toBe('Invalid request');
    })
    test('status 404 - ID does not exist', async () => {
        const response = await request(app).patch('/api/reviews/9999').send({inc_votes : 2}).expect(404);
        expect(response.body.message).toBe('Not found');
    })

    
})