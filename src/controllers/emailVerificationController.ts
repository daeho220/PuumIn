import { Request, Response } from 'express';
import redisClient from '../config/redis';
import { sendVerificationCode } from '../utils/email';

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증 코드 생성
};

const sendCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    const code = generateCode();

    try {
        await redisClient.set(email, code, { EX: 300 }); // 5분 유효 기간 설정
        await sendVerificationCode(email, code);
        res.status(200).json({
             success: true,
             message: 'Verification code sent'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Failed to send verification code',
            error: error
        });
    }
};

const verifyCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
        const storedCode = await redisClient.get(email);

        if (storedCode !== code) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        // Verification successful
        await redisClient.del(email);
        res.status(200).json({
            success: true,
            message: 'Verification successful'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Failed to verify code',
            error: error
        });
    }
};

export {sendCode, verifyCode};