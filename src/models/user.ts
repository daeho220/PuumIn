import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserData } from '../types/userData';
import { v4 as uuidv4 } from 'uuid';

const create = async (user: UserData): Promise<number> => {
    // const [result] = await pool.query<ResultSetHeader>('INSERT INTO Users (email, password) VALUES (?, ?, ?)', [user.email, user.username, user.password]);
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Users (email, password) VALUES (?, ?)', [user.email, user.password]);
    return result.insertId;
};

const findByEmail = async (email: string): Promise<UserData | undefined> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0] as UserData | undefined;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Users');
};

const createWithSocial = async (email: string, provider: string, providerId: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO Users (email, provider, provider_id) VALUES (?, ?, ?)', 
        [email, provider, providerId]
    );
    return result.insertId;
};

const updateSocialLoginInfo = async (userId: number, provider: string, providerId: number): Promise<void> => {
    await pool.query<ResultSetHeader>('UPDATE Users SET provider = ?, provider_id = ? WHERE id = ?', [provider, providerId, userId]);
};

export default { create, findByEmail, deleteAll, createWithSocial, updateSocialLoginInfo};