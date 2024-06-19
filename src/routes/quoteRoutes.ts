import express from 'express';
import { getAllPublicQuotes, createQuote, deleteQuote } from '../controllers/quoteController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       required:
 *         - content
 *         - author
 *         - is_public
 *         - user_idx
 *       properties:
 *         content:
 *           type: string
 *           description: The quote content
 *         author:
 *           type: string
 *           description: The author of the quote
 *         is_public:
 *           type: boolean
 *           description: Whether the quote is public
 *         user_idx:
 *           type: integer
 *           description: The ID of the user who created the quote
 *       example:
 *         content: "This is a sample quote."
 *         author: "John Doe"
 *         is_public: true
 *         user_idx: 1
 */

/**
 * @swagger
 * tags:
 *   name: Quotes
 *   description: API for managing quotes
 */

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Get all public quotes
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: A list of public quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quote'
 */
router.get('/quotes', getAllPublicQuotes);

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Create a new quote
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quote'
 *     responses:
 *       201:
 *         description: The quote was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the newly created quote
 *                 author:
 *                   type: string
 *                   description: The author of the newly created quote
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: 'Success to create quote'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.post('/quotes', authMiddleware, createQuote);

/**
 * @swagger
 * /api/quotes/{id}:
 *   delete:
 *     summary: Delete a quote
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The quote ID
 *     responses:
 *       200:
 *         description: Quote deleted successfully
 *       404:
 *         description: Quote not found
 *       500:
 *         description: Some server error
 */
router.delete('/quotes/:id', authMiddleware, deleteQuote);

export default router;