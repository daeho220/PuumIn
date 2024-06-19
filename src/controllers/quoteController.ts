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

export { getAllPublicQuotes, createQuote, deleteQuote };