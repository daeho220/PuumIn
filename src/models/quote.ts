import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Quote {
    id?: number;
    content: string;
    author: string;
    is_public: boolean;
    user_id: number;
}

const create = async (quote: Quote) => {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Quotes (content, author, is_public, user_id) VALUES (?, ?, ?, ?)', [quote.content, quote.author, quote.is_public, quote.user_id]);
    return result.insertId;
};

const findAllPublic = async () => {
    const [rows] = await pool.query('SELECT * FROM Quotes WHERE is_public = 1');
    return rows;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Quotes');
};

export default { create, findAllPublic, deleteAll };
