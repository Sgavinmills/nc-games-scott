const db = require('../db/connection.js');
const testData = require('../db/data/test-data/index.js');
const seed = require('../db/seeds/seed.js');
const request = require('supertest');
const app = require('../app.js');
const JSONEndPointsFile = require('../endpointlist.json');

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


    test('status 400 - invalid id passed', async () => {
        const response = await request(app).get('/api/reviews/NAME').expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
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
        expect(response.body.message).toBe('Missing data');
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
})

describe('GET api/reviews', () => {
    test('status 200 - returns an array of review objects', async () => {
        const response = await request(app).get('/api/reviews').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner : expect.any(String),
                title : expect.any(String),
                review_id : expect.any(Number),
                category : expect.any(String),
                review_img_url : expect.any(String),
                created_at : expect.any(String),
                votes : expect.any(Number),
                comment_count : expect.any(String)
            }))
            if(review.review_id === 1)
                expect(review.comment_count).toBe('0');
            if(review.review_id === 3) 
                expect(review.comment_count).toBe('3');
            
        })
    })
    test('status 200 - orders results by date by default', async () => {
        const response = await request(app).get('/api/reviews').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending : true });
    })
    test('status 200 - ?sort_by=owner', async () => {
        const response = await request(app).get('/api/reviews?sort_by=owner').expect(200);
        expect(response.body.reviews).toBeSortedBy('owner', { descending : true });
    })
    test('status 200 - ?sort_by=title', async () => {
        const response = await request(app).get('/api/reviews?sort_by=title').expect(200);
        expect(response.body.reviews).toBeSortedBy('title', { descending : true });
    })
    test('status 200 - ?sort_by=review_id', async () => {
        const response = await request(app).get('/api/reviews?sort_by=review_id').expect(200);
        expect(response.body.reviews).toBeSortedBy('review_id', { descending : true });
    })
    test('status 200 - ?sort_by=category', async () => {
        const response = await request(app).get('/api/reviews?sort_by=category').expect(200);
        expect(response.body.reviews).toBeSortedBy('category', { descending : true });
    })
    test('status 200 - ?sort_by=comment_count', async () => {
        const response = await request(app).get('/api/reviews?sort_by=comment_count').expect(200);
        expect(response.body.reviews).toBeSortedBy('comment_count', { descending : true });
    })
    test('status 200 - ?sort_by=votes', async () => {
        const response = await request(app).get('/api/reviews?sort_by=votes').expect(200);
        expect(response.body.reviews).toBeSortedBy('votes', { descending : true });
    })
    test('status 200 - ?sort_by=created_at', async () => {
        const response = await request(app).get('/api/reviews?sort_by=created_at').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending : true });
    })

    test('status 200 - ?order=asc changes order direction', async () => {
        const response = await request(app).get('/api/reviews?order=asc').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(10);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner : expect.any(String),
                title : expect.any(String),
                review_id : expect.any(Number),
                category : expect.any(String),
                review_img_url : expect.any(String),
                created_at : expect.any(String),
                votes : expect.any(Number),
                comment_count : expect.any(String)
            }))
            if(review.review_id === 1)
                expect(review.comment_count).toBe('0');
            if(review.review_id === 3) 
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
        expect(response.body.reviews).toBeSortedBy('comment_count', { descending : true });
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
            comment_count : '3'
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
        expect(response.body.message).toBe('Invalid sort query')
    })
    test('status 200 - Invalid order query defaults to default (desc)' , async () => {
        const response = await request(app).get('/api/reviews?order=NOPE').expect(200);
        expect(response.body.reviews).toBeSortedBy('created_at', { descending : true });
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
                comment_id : expect.any(Number),
                votes : expect.any(Number),
                created_at : expect.any(String),
                author : expect.any(String),
                body : expect.any(String)
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
        const response = await request(app).post('/api/reviews/1/comments').send({username : 'mallionaire', body : 'This review is a waste of time'}).expect(201);
        expect(response.body.comments).toBeInstanceOf(Object);
        expect(response.body.comments).toEqual({
            author : 'mallionaire',
            body : 'This review is a waste of time',
            comment_id : 7,
            votes : 0,
            created_at : expect.any(String),
            review_id : 1
        })
    })

    test('status 400 - Invalid review ID', async () => {
        const response = await request(app).post('/api/reviews/NOPE/comments').send({username : 'mallionaire', body : 'This review is a waste of time'}).expect(400);
        expect(response.body.message).toBe('Invalid data type')
    })
    test('status 404 - review_id valid but doesnt exist', async () => {
        const response = await request(app).post('/api/reviews/9999/comments').send({username : 'mallionaire', body : 'This review is a waste of time'}).expect(404);
        expect(response.body.message).toBe(`One of your values contradicts a foreign key constraint`)
    })
    test('status 400 - Extra properties provided', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({something : 'else', username : 'mallionaire', body : 'This review is a waste of time'}).expect(400);
        expect(response.body.message).toBe('Too many properties provided')
    })
    test('status 400 - Missing required property username', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({body : 'This review is a waste of time'}).expect(400);
        expect(response.body.message).toBe('username property required')
    })
    test('status 400 - Missing required property body', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({username : 'mallionaire'}).expect(400);
        expect(response.body.message).toBe('body property required')
    })
    test('status 404 - Username doesnt exist', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({username : 'King', body : 'This review is a waste of time'}).expect(404);
        expect(response.body.message).toBe(`One of your values contradicts a foreign key constraint`)
    })
    test('status 400 - Body is too long', async () => {
        const response = await request(app).post('/api/reviews/1/comments').send({username : 'mallionaire', body : 'x'.repeat(2001) }).expect(400);
        expect(response.body.message).toBe('Value too long')
    })
  
})

//how to test this one was successful besides status code?
describe('DELETE /api/comments/:comment_id', () => {
    test('status 204 - deletes comment by id', async () => {
        const response = await request(app).delete('/api/comments/1').expect(204);
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
            { username : 'mallionaire' },
            { username : 'philippaclaire9' },
            { username : 'bainesface' },
            { username : 'dav3rid' }
        ])
    })
})

describe('GET /api/users/:username', () => {
    test('status 200 - responds with a user object', async () => {
        const response = await request(app).get('/api/users/mallionaire').expect(200);
        expect(response.body.users).toBeInstanceOf(Object);
        expect(response.body.users).toEqual({
              username : 'mallionaire',
              avatar_url : 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
              name : 'haz'
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
            comment_id : 1,
            author : 'bainesface',
            review_id : 2,
            votes : 21,
            created_at : '2017-11-22T12:43:33.389Z',
            body : 'I loved this game too!'
        })
    })
    test('status 200 - negative votes dont go below 0', async () => {
        const response = await request(app).patch('/api/comments/1').send({ inc_votes: -50 }).expect(200);
        expect(response.body.comments).toBeInstanceOf(Object);
        expect(response.body.comments).toEqual({
            comment_id : 1,
            author : 'bainesface',
            review_id : 2,
            votes : 0,
            created_at : '2017-11-22T12:43:33.389Z',
            body : 'I loved this game too!'
        })
    })

    test('status 400 - Invalid coment_id data type', async () => {
        const response = await request(app).patch('/api/comments/NOPE').send({ inc_votes : 10}).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })
    test('status 404 - Valid but non-existent commen_id', async () => {
        const response = await request(app).patch('/api/comments/9999').send({ inc_votes : 10}).expect(404);
        expect(response.body.message).toBe('9999 not found');
    })
    test('status 400 - Missing inc_votes property', async () => {
        const response = await request(app).patch('/api/comments/1').send({}).expect(400);
        expect(response.body.message).toBe('inc_votes property required');
    })
    test('status 400 - Additional properties sent', async () => {
        const response = await request(app).patch('/api/comments/1').send({inc_votes : 10, something : 'else' }).expect(400);
        expect(response.body.message).toBe('Extra properties provided');
    })
    test('status 400 - inc_votes provided with invalid data type', async () => {
        const response = await request(app).patch('/api/comments/1').send({inc_votes : 'nope'}).expect(400);
        expect(response.body.message).toBe('Invalid data type');
    })

})

describe('GET /api/reviews Pagination', () => {
    test('status 200 - reviews results allows limit query', async () => {
        const response = await request(app).get('/api/reviews?limit=11').expect(200);
        expect(response.body.reviews).toBeInstanceOf(Array);
        expect(response.body.reviews).toHaveLength(11);
        response.body.reviews.forEach(review => {
            expect(review).toEqual(expect.objectContaining({
                owner : expect.any(String),
                title : expect.any(String),
                review_id : expect.any(Number),
                category : expect.any(String),
                review_img_url : expect.any(String),
                created_at : expect.any(String),
                votes : expect.any(Number),
                comment_count : expect.any(String)
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


//then Pauls comments
//then fix up the messy model functions 


// describe.skip('POST /api/reviews', () => {
//     test('status 200 - Creates a new review', async () => {
//         const response = await request(app).post('/api/reviews').send(postSend).expect(201);
//         expect(response.body.reviews).toEqual({
            
//         })
//     })
// }
//
