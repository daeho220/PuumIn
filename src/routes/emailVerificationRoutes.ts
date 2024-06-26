import express from 'express';
import { sendCode, verifyCode } from '../controllers/emailVerificationController';

const router = express.Router();

/**
 * @swagger
 * /auth/send-code:
 *   post:
 *     summary: Send a verification code to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *             example:
 *               email: user@example.com
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *       500:
 *         description: Failed to send verification code
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
router.post('/send-code', sendCode);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify the email verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *               code:
 *                 type: string
 *                 description: The verification code
 *             example:
 *               email: user@example.com
 *               code: "123456"
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Success'
 *       400:
 *         description: Invalid verification code
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
 *                   description: 'Invalid verification code'
 *                   example: 'Invalid verification code'
 *       500:
 *         description: Failed to verify code
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
router.post('/verify-code', verifyCode);

export default router;
