import express from 'express';
import { register, login, logout, socialLogin } from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 *         username:
 *           type: string
 *           description: The user's username
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: test@example.com
 *         username: testuser
 *         password: password
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The authentication managing API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "password"
 *     responses:
 *       201:
 *         description: The user was successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the newly registered user
 *                       example: 1
 *                     email:
 *                       type: string
 *                       description: The email of the newly registered user
 *                       example: "test@example.com"
 *       500:
 *         description: Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for the user
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: 'Invalid email or password'
 *                   example: 'Invalid email or password'
 *       500:
 *         description: Login failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/social-login:
 *   post:
 *     summary: Social login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessToken
 *               - provider
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: The access token from the social provider
 *                 example: "AccessToken"
 *               provider:
 *                 type: string
 *                 description: The social provider (e.g., kakao, naver)
 *                 example: "kakao"
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for the user
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       400:
 *         description: Invalid provider or user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 *       500:
 *         description: Social login failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.post('/social-login', socialLogin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *       500:
 *         description: Logout failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.post('/logout', logout);

export default router;