import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
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
             message: 'Success'
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Error',
            error: errorMessage
        });
    }
};

const verifyCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
        const storedCode = await redisClient.get(email);

        if (storedCode !== code) {
            return res.status(400).json({ 
                message: 'Error', 
                error: 'Invalid verification code' 
            });
        }

        // Verification successful
        await redisClient.set(`verified_${email}`, 'true', { EX: 600 }); // 10분 동안 유효
        await redisClient.del(email);
        res.status(200).json({
            message: 'Success',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Error',
            error: errorMessage
        });
    }
};

export {sendCode, verifyCode};