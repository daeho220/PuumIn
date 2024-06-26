import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import { UserData } from '../types/userData';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (req: Request, res: Response<ApiResponse<UserData>>) => {
    try {
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({ email, username, password: hashedPassword });
        res.status(201).json({
            message: 'Success',
            data: {
                id: userId,
                email: email,
                username: username,
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Error',
            error: errorMessage,
         });
    }
};

const login = async (req: Request, res: Response<ApiResponse<object>>) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ 
                message: 'Error',
                error: 'Invalid email or password' 
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
        res.json({ 
            message: 'Success', 
            data: { JWTtoken: token } 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Error', 
            error: errorMessage 
        });
    }
};

const logout = async (req: Request, res: Response<ApiResponse<string>>) => {
    try {
        res.status(200).send({
            message: 'Success',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).send({
            message: 'Error',
            error: errorMessage
        });
    }
};

export { register, login, logout };
