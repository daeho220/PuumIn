import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // 'Bearer ' 부분을 제거
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
            return res.status(401).json({ error: 'Failed to authenticate token' });
        }
        
        req.userIdx = (decoded as JwtPayload).id;
        next();
    });
};

export default authMiddleware;