import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserData } from '../types/userData';

const create = async (user: UserData): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Users (email, username, password) VALUES (?, ?, ?)', [user.email, user.username, user.password]);
    return result.insertId;
};

const findByEmail = async (email: string): Promise<UserData | undefined> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0] as UserData | undefined;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Users');
};

export default { create, findByEmail, deleteAll};