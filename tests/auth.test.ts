import request from 'supertest'
import app from '../src/app'
import User from '../src/models/user';

afterAll(async () => {
    // Clean up database
    await User.deleteAll();
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        'email': 'jest1@example.com',
        'username': 'testuser',
        'password': 'password',
      })
    expect(res.statusCode).toEqual(201)
    expect(res.body).toHaveProperty('id')
  })

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'jest1@example.com',
        password: 'password',
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('token')
  })
})
