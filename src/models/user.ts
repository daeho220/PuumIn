import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


interface User {
    id?: number;
    email: string;
    username: string;
    password: string;
}

const create = async (user: User): Promise<number> => {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Users (email, username, password) VALUES (?, ?, ?)', [user.email, user.username, user.password]);
    return result.insertId;
};

const findByEmail = async (email: string): Promise<User | undefined> => {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Users WHERE email = ?', [email]);
    return rows[0] as User | undefined;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Users');
};

export default { create, findByEmail, deleteAll};