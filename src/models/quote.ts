import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Quote {
    id?: number;
    content: string;
    author: string;
    is_public: boolean;
    user_idx: number;
}

const create = async (quote: Quote) => {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Quotes (content, author, is_public, user_idx) VALUES (?, ?, ?, ?)', [quote.content, quote.author, quote.is_public, quote.user_idx]);
    return result.insertId;
};

const findAllPublic = async () => {
    const [rows] = await pool.query('SELECT * FROM Quotes WHERE is_public = 1');
    return rows;
};

const deleteById = async (id: number) => {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM Quotes WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Quotes');
};

export default { create, findAllPublic, deleteById, deleteAll };