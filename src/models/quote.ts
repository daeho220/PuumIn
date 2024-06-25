import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Quote {
    id?: number;
    content: string;
    author?: string;
    is_public: boolean;
    user_idx: number;
}

const create = async (quote: Quote) => {
    const [result] = await pool.query<ResultSetHeader>('INSERT INTO Quotes (content, is_public, user_idx) VALUES (?, ?, ?)', [quote.content, quote.is_public, quote.user_idx]);
    return result.insertId;
};

const findAllPublic = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    // 전체 공개 인용구 수를 가져오는 쿼리
    const countQuery = 'SELECT COUNT(*) AS count FROM Quotes WHERE is_public = 1';
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery);
    const totalItems = countResult[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    // 페이지네이션을 적용하여 공개 인용구를 가져오는 쿼리
    const dataQuery = 'SELECT * FROM Quotes WHERE is_public = 1 LIMIT ? OFFSET ?';
    const [dataRows] = await pool.query(dataQuery, [limit, offset]);

    return {
        currentPage: page,
        totalPages: totalPages,
        totalItemCount: totalItems,
        data: dataRows
    };
};

const deleteById = async (id: number) => {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM Quotes WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const deleteAll = async () => {
    await pool.query('DELETE FROM Quotes');
};

const reportById = async (id: number) => {
    // 신고 횟수 증가
    await pool.query<ResultSetHeader>('UPDATE Quotes SET reports_count = reports_count + 1 WHERE id = ?', [id]);

    // 신고 횟수 확인
    const [result] = await pool.query<RowDataPacket[]>('SELECT reports_count FROM quotes WHERE id = ?', [id]);
    const reportsCount = result.length > 0 ? result[0].reports_count : 0;

    return reportsCount;
};

const updatePublicStatus = async (id: number, isPublic: boolean) => {
    await pool.query<ResultSetHeader>('UPDATE Quotes SET is_public = ? WHERE id = ?', [isPublic ? 1 : 0, id]);
};

export default { create, findAllPublic, deleteById, deleteAll, reportById, updatePublicStatus };
