import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import redisClient from '../config/redis';
import { sendVerificationCode } from '../utils/email';
import logMessage from '../config/logger';

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증 코드 생성
};

const sendCode = async (req: Request, res: Response) => {
    const { email } = req.body;
    const code = generateCode();

    try {
        await redisClient.set(email, code, { EX: 300 }); // 5분 유효 기간 설정
        await sendVerificationCode(email, code);

        logMessage({code:104, msg:`userEmail: ${email}`});
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:415, msg:`Error: ${errorMessage}`});

        res.status(500).json({ 
            success: false,
            error: errorMessage
        });
    }
};

const verifyCode = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
        const storedCode = await redisClient.get(email);

        if (storedCode !== code) {
            logMessage({code:416, msg:`userEmail: ${email}`});

            return res.status(400).json({ 
                success: false, 
                error: 'Invalid verification code' 
            });
        }

        // Verification successful
        await redisClient.set(`verified_${email}`, 'true', { EX: 600 }); // 10분 동안 유효
        await redisClient.del(email);

        logMessage({code:105, msg:`userEmail: ${email}`});
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:417, msg:`Error: ${errorMessage}`});

        res.status(500).json({ 
            success: false,
            error: errorMessage
        });
    }
};

export {sendCode, verifyCode};