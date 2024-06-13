import { Request, Response } from 'express';
import Quote from '../models/quote';

const getAllPublicQuotes = async (req: Request, res: Response) => {
    try {
        const quotes = await Quote.findAllPublic();
        res.json(quotes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve quotes' });
    }
};

const createQuote = async (req: Request, res: Response) => {
    try {
        const { content, author, is_public, user_id } = req.body;
        const quoteId = await Quote.create({ content, author, is_public, user_id });
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

export { getAllPublicQuotes, createQuote };