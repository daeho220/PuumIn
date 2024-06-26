import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import { UserData } from '../types/userData';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import axios from 'axios';

const register = async (req: Request, res: Response<ApiResponse<UserData>>) => {
    const { email, username, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (user) {
            return res.status(400).json({ 
                message: 'Error', 
                error: 'User already exists' 
            });
        }
        // Redis에서 이메일 인증 상태 확인
        const isVerified = await redisClient.get(`verified_${email}`);
        if (!isVerified) {
            return res.status(400).json({
                message: 'Error',
                error: 'Email not verified. Please verify your email before registering.'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await User.create({ email, username, password: hashedPassword });

        // Redis에서 인증 정보 삭제
        await redisClient.del(`verified_${email}`);

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
        if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
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

const kakaoLogin = async (req: Request, res: Response) => {
    const { accessToken } = req.body;

    try {
        // 카카오 API를 통해 액세스 토큰 검증 및 사용자 정보 획득
        const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    
        const { id: kakaoId, kakao_account: { email, profile: { nickname } } } = userInfoResponse.data;
    
        if (email || nickname) {
            return res.status(400).json({ 
                message: 'Error', 
                error: 'User information needs to be verified' 
            });
        }
    
        let user = await User.findByEmail(email);
        if (user) {
            return res.status(400).json({ 
                message: 'Error', 
                error: 'User already exists' 
            });
        } else {
            const userId = await User.createWithKakao(email, nickname);
    
            user = {
                id: userId,
                email: email,
                username: nickname
            };
    
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }
            const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' });
    
            res.status(200).json({
                message: 'Success',
                data: { JWTtoken: token }
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Error', 
            error: errorMessage 
        });
    }

}


export { register, login, logout };
