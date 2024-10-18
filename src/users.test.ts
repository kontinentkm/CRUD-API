import request from 'supertest';
import express from 'express';
import { usersRouter } from './users';

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

describe('Users API', () => {
  it('should return an empty array when GET api/users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new user with POST api/users', async () => {
    const newUser = { username: 'John', age: 30, hobbies: ['reading', 'gaming'] };
    const response = await request(app).post('/api/users').send(newUser);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newUser);
    expect(response.body).toHaveProperty('id');
  });

  it('should return the created user by GET api/users/{userId}', async () => {
    const newUser = { username: 'Jane', age: 25, hobbies: ['music'] };
    const createResponse = await request(app).post('/api/users').send(newUser);
    
    const userId = createResponse.body.id;
    const response = await request(app).get(`/api/users/${userId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(createResponse.body);
  });

  it('should update an existing user with PUT api/users/{userId}', async () => {
    const newUser = { username: 'Alice', age: 28, hobbies: ['sports'] };
    const createResponse = await request(app).post('/api/users').send(newUser);
    
    const userId = createResponse.body.id;
    const updatedUser = { username: 'Alice Updated', age: 29, hobbies: ['sports', 'reading'] };
    const response = await request(app).put(`/api/users/${userId}`).send(updatedUser);
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(updatedUser);
    expect(response.body.id).toBe(userId);
  });

  it('should delete a user with DELETE api/users/{userId}', async () => {
    const newUser = { username: 'Bob', age: 32, hobbies: ['cooking'] };
    const createResponse = await request(app).post('/api/users').send(newUser);
    
    const userId = createResponse.body.id;
    const response = await request(app).delete(`/api/users/${userId}`);
    
    expect(response.status).toBe(204);
  });
});
