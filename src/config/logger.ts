import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config();

const winstonLogger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(
            info => `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`
        )
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: path.join(`${process.env.LOG_PATH}/system.log`),
            zippedArchive: false
        }),
        new transports.Console()
    ]
});

const logs: { [key: number]: string } = {

    //Auth info
    100: "register: Success to create User",
    101: "login: Success to login",
    102: "lgout: Success to logout",
    103: "createSocialUser: Success to create Social User",
    104: "sendCode: Success to send the verification code",
    105: "verifyCode: The verification code matches.",
    106: "deleteUser: User ID deleted.",

    //Quotes info
    200: "getAllPublicQuotes: Success to get Quotes",
    201: "createQuote: Success to create a Quote",
    202: "deleteQuote: Success to delete a Quote",
    203: "reportQuote: This Quote has been made private.",
    204: "reportQuote: This Quote has been reported.",

    //etc info

    //Auth error
    400: "register: User already exists",
    401: "register: Email not verified. Please verify your email before registering.",
    402: "register: Password must be at least 8 characters long and include at least one letter, one number, and one special character.",
    403: "register: Try Catch Error.",
    404: "login: User already exists with a different social provider",
    405: "login: Invalid email or password",
    406: "login: JWT_SECRET is not defined",
    407: "login: Try Catch Error.",
    408: "logout: Try Catch Error.",
    409: "socialLogin: Invalid social provider",
    410: "createSocialUser: User already exists with a different social provider",
    411: "createSocialUser: User ID is undefined",
    412: "createSocialUser: JWT_SECRET is not defined",
    413: "socialLogin: Try Catch Error.",
    414: "createSocialUser: Try Catch Error.",
    415: "sendCode: Try Catch Error.",
    416: "verifyCode: Invalid verification code.",
    417: "verifyCode: Try Catch Error.",
    418: "authMiddleware: JWT_SECRET is not defined",
    419: "authMiddleware: Failed to authenticate token",
    420: "authMiddleware: No Header provided",
    421: "authMiddleware: No token provided",
    422: "deleteUser: Invalid user ID",
    423: "deleteUser: User ID not found",
    424: "deleteUser: Try Catch Error.",
    425: "deleteUser: Quote deleteByUserId Try Catch Error.",
    
    //Quotes error
    500: "getAllPublicQuotes: Try Catch Error.",
    501: "createQuote: Invalid user index.",
    502: "createQuote: Try Catch Error.",
    503: "deleteQuote: Quote not found.",
    504: "deleteQuote: Try Catch Error.",
    505: "reportQuote: Try Catch Error.",

    //etc error


    999: "Debug Log"
}

const logMessage = (param: {code?: number, msg?: string}) => {
    const code = param.code;
    const codeLog = code? `[CODE ${code}] ${logs[code]}` : "";
    
    
    const message = param.msg || "";

    if (code === 999) {
        winstonLogger.debug(`${codeLog} ## ${message}`);
    } else if (code && code >= 400) {
        winstonLogger.error(`${codeLog} ## ${message}`);
    } else {
        winstonLogger.info(`${codeLog} ## ${message}`);
    }
}

export default logMessage;