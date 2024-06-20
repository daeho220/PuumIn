import { Request, Response } from 'express';
import Quote from '../models/quote';

const getAllPublicQuotes = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // 데이터베이스에서 인용구 가져오기 (예시 코드)
        const quotes = await Quote.findAllPublic(page, limit);

        const totalPages = quotes.totalPages;
        const totalItemCount = quotes.totalItemCount;
        const data = quotes.data;

        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalItemCount: totalItemCount,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve quotes',
            error: error
        });
    }
};

const createQuote = async (req: Request, res: Response) => {
    try {
        const { content, author, is_public, user_idx } = req.body;
        const quoteId = await Quote.create({ content, author, is_public, user_idx });
        res.status(201).json({ 
            id: quoteId,
            author: author,
            message: 'Success to create quote',
        });
    } catch (error) {
        res.status(500).json({ 
            error: error,
            message: 'Failed to create quote',
        });
    }
};

const deleteQuote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const success = await Quote.deleteById(Number(id));
        if (success) {
            res.status(200).json({
                id: id,
                message: 'Quote deleted successfully' 
            });
        } else {
            res.status(404).json({ 
                error: 'Quote not found',
                message: 'Failed to delete quote'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error,
            message: 'Failed to delete quote'
        });
    }
};

const reportQuote = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const reportsCount = await Quote.reportById(Number(id));
        if (reportsCount >= 10) {
            await Quote.updatePublicStatus(Number(id), false);
            res.status(200).send({ message: 'The quote has been set to private.' });
        } else {
            res.status(200).send({ message: 'Report has been registered.', reportsCount });
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error occurred.' });
    }
};

export { getAllPublicQuotes, createQuote, deleteQuote, reportQuote };
