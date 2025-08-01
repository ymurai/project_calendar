
const request = require('supertest');
const app = require('./index'); // Assuming your express app is exported from index.js
const { db, initializeDatabase } = require('./database/db');

beforeAll((done) => {
  initializeDatabase(done);
});

afterAll((done) => {
  db.close(done);
});

beforeEach((done) => {
  db.serialize(() => {
    db.run('DELETE FROM events', () => {
      db.run('DELETE FROM sqlite_sequence WHERE name="events"', done);
    });
  });
});

describe('Events API', () => {
  it('should get all events (initially empty)', async () => {
    const res = await request(app).get('/api/v1/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('should create a new event', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        event_date: '2025-08-01',
        content: 'Test event'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.event_date).toBe('2025-08-01');
    expect(res.body.content).toBe('Test event');
  });

  it('should not create an event with invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .send({
        event_date: 'invalid-date',
        content: ''
      });
    expect(res.statusCode).toEqual(400);
  });

  it('should get an event by id', async () => {
    // First, create an event
    const postRes = await request(app)
      .post('/api/v1/events')
      .send({
        event_date: '2025-08-02',
        content: 'Event to be fetched'
      });
    const eventId = postRes.body.id;

    // Then, get the event by id
    const getRes = await request(app).get(`/api/v1/events/${eventId}`);
    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.id).toEqual(eventId);
  });

  it('should return 404 for a non-existent event id', async () => {
    const res = await request(app).get('/api/v1/events/999');
    expect(res.statusCode).toEqual(404);
  });

  it('should update an event', async () => {
    // First, create an event
    const postRes = await request(app)
      .post('/api/v1/events')
      .send({
        event_date: '2025-08-03',
        content: 'Event to be updated'
      });
    const eventId = postRes.body.id;

    // Then, update the event
    const putRes = await request(app)
      .put(`/api/v1/events/${eventId}`)
      .send({
        content: 'Updated content'
      });
    expect(putRes.statusCode).toEqual(200);
    expect(putRes.body.content).toBe('Updated content');
  });

  it('should delete an event', async () => {
    // First, create an event
    const postRes = await request(app)
      .post('/api/v1/events')
      .send({
        event_date: '2025-08-04',
        content: 'Event to be deleted'
      });
    const eventId = postRes.body.id;

    // Then, delete the event
    const deleteRes = await request(app).delete(`/api/v1/events/${eventId}`);
    expect(deleteRes.statusCode).toEqual(204);

    // Verify it's deleted
    const getRes = await request(app).get(`/api/v1/events/${eventId}`);
    expect(getRes.statusCode).toEqual(404);
  });
});
