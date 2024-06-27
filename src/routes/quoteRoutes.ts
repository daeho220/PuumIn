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
 *         - isPublic
 *         - userIdx
 *       properties:
 *         content:
 *           type: string
 *           description: The quote content
 *         isPublic:
 *           type: boolean
 *           description: Whether the quote is public
 *         userIdx:
 *           type: integer
 *           description: The ID of the user who created the quote
 *       example:
 *         content: "This is a sample quote."
 *         isPublic: true
 *         userIdx: 1
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
 *     summary: Get all public quotes with pagination
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number of the quotes listing
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of quotes per page
 *     responses:
 *       200:
 *         description: A paginated list of public quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     totalItemCount:
 *                       type: integer
 *                       description: Total number of quotes
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Quote'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.get('/quotes', getAllPublicQuotes);

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Create a new quote
 *     description: >
 *       "Required JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - isPublic
 *             properties:
 *               content:
 *                 type: string
 *                 description: The quote content
 *                 example: "This is a sample quote."
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the quote is public
 *                 example: true
 *     responses:
 *       201:
 *         description: The quote was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created quote
 *                     content:
 *                       type: string
 *                       description: The content of the quote
 *                       example: "This is a sample quote."
 *                     isPublic:
 *                       type: boolean
 *                       description: Whether the quote is public
 *                       example: true
 *                     userIdx:
 *                       type: integer
 *                       description: The ID of the user who created the quote
 *                       example: 1
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Invalid user index'
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Unknown error'
 */
router.post('/quotes', authMiddleware, createQuote);

/**
 * @swagger
 * /api/quotes/{id}:
 *   delete:
 *     summary: Delete a quote
 *     description: >
 *       "Required JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message
 *                   example: 'Success'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the deleted quote
 *       404:
 *         description: Quote not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: 'Quote not found'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: 'Error'
 *                 error:
 *                   type: string
 *                   description: Detailed error error message
 *                   example: 'Unknown error'
 */
router.delete('/quotes/:id', authMiddleware, deleteQuote);

export default router;