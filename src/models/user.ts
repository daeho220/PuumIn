import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserData } from '../types/userData';

const create = async (user: UserData): Promise<number> => {
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

const deleteById = async (userIdx: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM Users WHERE id = ?', [userIdx]);
    return result.affectedRows > 0;
};

const createWithSocial = async (email: string, socialProvider: string, socialId: number): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO Users (email, social_provider, social_id) VALUES (?, ?, ?)', 
        [email, socialProvider, socialId]
    );
    return result.insertId;
};

const updateSocialLoginInfo = async (userId: number, socialProvider: string, socialId: number): Promise<void> => {
    await pool.query<ResultSetHeader>('UPDATE Users SET social_provider = ?, social_id = ? WHERE id = ?', [socialProvider, socialId, userId]);
};

export default { create, findByEmail, deleteAll, createWithSocial, updateSocialLoginInfo, deleteById};