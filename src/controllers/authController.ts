import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import { UserData } from '../types/userData';
import { validatePassword } from '../utils/validatePassword';
import logMessage from '../config/logger';

import User from '../models/user';
import Quote from '../models/quote';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';
import axios from 'axios';

const register = async (req: Request, res: Response<ApiResponse<UserData>>) => {
    // const { email, userName, password } = req.body;
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (user) {
            logMessage({code:400, msg:`UserEmail: ${email}`});
            return res.status(400).json({ 
                message: 'Error', 
                error: 'User already exists' 
            });
        }
        // Redis에서 이메일 인증 상태 확인
        const isVerified = await redisClient.get(`verified_${email}`);
        if (!isVerified) {
            logMessage({code:401, msg:""});
            return res.status(400).json({
                message: 'Error',
                error: 'Email not verified. Please verify your email before registering.'
            });
        }

        // 비밀번호 유효성 검사
        if (!validatePassword(password)) {
            logMessage({code:402, msg:""});
            return res.status(400).json({
                message: 'Error',
                error: 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // const userId = await User.create({ email, userName, password: hashedPassword });
        const userId = await User.create({ email, password: hashedPassword });

        // Redis에서 인증 정보 삭제
        await redisClient.del(`verified_${email}`);

        logMessage({code:100, msg:`userId: ${userId}`});
        res.status(201).json({
            message: 'Success',
            data: {
                id: userId,
                email: email,
                // userName: userName,
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:403, msg:`Error: ${errorMessage}`});

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

        if(user?.socialProvider && !user.password){
            logMessage({code:404, msg:`userEmail: ${email}`});
            return res.status(400).json({
                message: 'Error',
                error: 'User already exists with a different social provider'
            });
        }

        if (!user || !user.password || !await bcrypt.compare(password, user.password)) {
            logMessage({code:405, msg:""});
            return res.status(401).json({ 
                message: 'Error',
                error: 'Invalid email or password' 
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logMessage({code: 406, msg: ""});
            return res.status(500).json({
                message: 'Error',
                error: 'JWT_SECRET is not defined'
            });
        }

        const token = jwt.sign({ id: user.id }, secret);
        logMessage({code:101, msg:`userEmail: ${email}`});

        res.json({ 
            message: 'Success', 
            data: { token: token } 
        });
    } catch (error) {

        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:407, msg:`Error: ${errorMessage}`});

        res.status(500).json({ 
            message: 'Error', 
            error: errorMessage 
        });
    }
};

const logout = async (req: Request, res: Response<ApiResponse<string>>) => {
    try {
        logMessage({code:102, msg:""});
        res.status(200).send({
            message: 'Success',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:408, msg:""});

        res.status(500).send({
            message: 'Error',
            error: errorMessage
        });
    }
};

const socialLogin = async (req: Request, res: Response) => {
    const { accessToken, socialProvider } = req.body;

    try {
        let apiUrl = '';
        if (socialProvider === 'kakao') {
            apiUrl = 'https://kapi.kakao.com/v2/user/me';
        } else if (socialProvider === 'naver') {
            apiUrl = 'https://openapi.naver.com/v1/nid/me';
        } else {
            logMessage({code:409, msg:""});
            return res.status(400).json({ 
                message: 'Error', 
                error: 'Invalid socialProvider' 
            });
        }

        const userInfoResponse = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        //테스트용 코드 sssssssssssssssss
        // let userInfoResponse;
        // if(socialProvider === 'kakao'){
        //     userInfoResponse ={
        //         data: {
        //             id: 123,
        //             kakao_account: {
        //                 email: 'daeho220@naver.com'
        //             }
        //         }
        //     };

        // } else if (socialProvider === 'naver'){
        //     userInfoResponse ={
        //         data: {
        //             response: {
        //                 id: 123,
        //                 email: 'daeho220@naver.com'
        //             }
        //         }
        //     };
        // }

        // if (!userInfoResponse) {
        //     return res.status(400).json({ 
        //         message: 'Error', 
        //         error: 'User info response is undefined' 
        //     });
        // }
        //테스트용 코드 eeeeeeeeeeeeeeeeeeee


        const userInfo = extractUserInfo(userInfoResponse.data, socialProvider);
        if (!userInfo || !userInfo.socialId || !userInfo.email) {
            logMessage({code:410, msg:""});

            return res.status(400).json({ 
                message: 'Error', 
                error: 'Invalid user information' 
            });
        }
        const { socialId, email } = userInfo;
        createSocialUser(email, socialProvider, socialId, res);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:413, msg:`Error: ${errorMessage}`});

        res.status(500).json({ 
            message: 'Error', 
            error: errorMessage 
        });
    }
}

const createSocialUser = async (email: string, socialProvider: string, socialId: number, res: Response) => {
    try {
        let user = await User.findByEmail(email);
        // console.log(user)
        if(user) {
            // 해당 이메일을 가진 유저가 존재하는 경우, 해당 유저의 소셜 로그인 정보를 업데이트
            if (user.id !== undefined) {
                if (user.socialProvider && user.socialProvider !== socialProvider) {
                    // 소셜 로그인을 한 유저는 네이버, 카카오 중 한 곳에만 존재할 수 있음. 따라서, provider 체크를 하여, 다른 소셜 계정으로 로그인 시도 시 오류 메시지 반환
                    logMessage({code:410, msg:""});

                    return res.status(400).json({
                        message: 'Error', 
                        error: 'User already exists with a different social provider' 
                    });
                }
                await User.updateSocialLoginInfo(user.id, socialProvider, socialId);
            } else {
                // 유저의 ID가 정의되지 않은 경우, 오류 메시지 반환
                logMessage({code:411, msg:""});

                return res.status(400).json({ 
                    message: 'Error', 
                    error: 'User ID is undefined' 
                });
            }
        } else {
            //유저가 존재하지 않는 경우, 새로운 소셜 로그인용 유저를 생성
            const userId = await User.createWithSocial(email, socialProvider, socialId);
            user = {
                id: userId,
                email: email,
            };
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logMessage({code: 406, msg: ""});
            return res.status(500).json({
                message: 'Error',
                error: 'JWT_SECRET is not defined'
            });
        }

        const token = jwt.sign({ userId: user.id }, secret);
        logMessage({code:103, msg:`userEmail: ${email}, socialProvider: ${socialProvider}`});
        res.status(200).json({
            message: 'Success',
            data: { token: token }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:414, msg:`Error: ${errorMessage}`});
        
        res.status(500).json({ 
            message: 'Error', 
            error: errorMessage 
        });
    }
};

const extractUserInfo = (data: any, socialProvider: string): { socialId: number | null, email: string | null } => {

    const newUserData = (id: number, email: string) => {
        const userData = {
          socialId: id,
          email: email,
        };
  
        return userData;
    };

    if (socialProvider === 'kakao') {
        const { id: kakaoId, kakao_account: { email } } = data;
        return newUserData(kakaoId, email);
    } else if (socialProvider === 'naver') {
        const { response: { id, email } } = data;
        return newUserData(id, email);
    }
    return { socialId: null, email: null };
};

const deleteUser = async (req: Request, res: Response<ApiResponse<object>>) => {
    try {
        const userIdx = Number(req.userIdx);

        if (isNaN(userIdx)) {
            logMessage({code: 422, msg: ""});
            return res.status(401).json({
                message: 'Error',
                error: 'Invalid user ID'
            });
        }

        try {
            // 관련된 quotes 먼저 삭제
            await Quote.deleteByUserId(userIdx);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
            logMessage({code: 425, msg: `Error: ${errorMessage}`});
    
            return res.status(500).json({
                message: 'Error',
                error: errorMessage
            });
        }

        const deletedUser = await User.deleteById(userIdx);

        if (!deletedUser) {
            logMessage({code: 423, msg: `userIdx: ${userIdx}`});
            return res.status(404).json({
                message: 'Error',
                error: `User ID ${userIdx} not found`
            });
        }

        logMessage({code: 106, msg: `userIdx: ${userIdx}`});
        res.status(200).json({
            message: 'Success',
            data: {
                userIdx: userIdx
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code: 424, msg: `Error: ${errorMessage}`});

        res.status(500).json({
            message: 'Error',
            error: errorMessage
        });
    }

};

export { register, login, logout, socialLogin, deleteUser };
