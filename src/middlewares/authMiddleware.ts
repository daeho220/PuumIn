import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logMessage from '../config/logger';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        logMessage({code: 420, msg: ""});
        return res.status(401).json({ error: 'No Header provided' });
    }

    const token = authHeader.split(' ')[1]; // 'Bearer ' 부분을 제거
    if (!token) {
        logMessage({code: 421, msg: ""});
        return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logMessage({code: 418, msg: ""});
        return res.status(500).json({
            message: 'Error',
            error: 'JWT_SECRET is not defined'
        });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
            logMessage({code: 419, msg: ""});
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        
        req.userIdx = (decoded as JwtPayload).id;
        next();
    });
};

export default authMiddleware;