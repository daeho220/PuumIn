import request from 'supertest';
import app from '../src/app';
import User from '../src/models/user';
import Quote from '../src/models/quote';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let token: string;
let userId: number;

beforeAll(async () => {
    // Test user setup
    const password = await bcrypt.hash('password', 10);
    userId = await User.create({ email: 'test@example.com', username: 'testuser', password });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
});

afterAll(async () => {
    // Clean up database
    await Quote.deleteAll();
    await User.deleteAll();
});

describe('Quotes API', () => {
    it('should fetch all public quotes', async () => {
        const response = await request(app).get('/api/quotes');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('should create a new quote', async () => {
        const newQuote = {
            content: 'This is a test quote',
            author: 'John Doe',
            is_public: true,
            user_id: userId,
        };
        const response = await request(app)
            .post('/api/quotes')
            .set('Authorization', `Bearer ${token}`)
            .send(newQuote);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('message', 'Success to create quote');
    });
});
