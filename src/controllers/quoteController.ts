import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import { PagedData } from '../types/pagedData';
import { QuoteData } from '../types/quoteData';

import Quote from '../models/quote';

const getAllPublicQuotes = async (req: Request, res: Response<ApiResponse<PagedData<QuoteData>>>) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // 데이터베이스에서 인용구 가져오기 (예시 코드)
        const quotes = await Quote.findAllPublic(page, limit);

        const totalPages = quotes.totalPages;
        const totalItemCount = quotes.totalItemCount;
        const data = (quotes.data as any[]).map((item: any) => ({
            id: item.id,
            content: item.content,
            author: item.author,
            isPublic: item.is_public,
            userIdx: item.user_idx,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            reportsCount: item.reports_count,
        }));

        res.status(200).json({
            message: 'Quotes got successfully',
            data: {
                currentPage: page,
                totalPages: totalPages,
                totalItemCount: totalItemCount,
                items: data
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({
            message: 'Failed to get quotes',
            error: errorMessage
        });
    }
};

const createQuote = async (req: Request, res: Response<ApiResponse<QuoteData>>) => {
    try {
        const { content, author, is_public, user_idx } = req.body;
        const quoteId = await Quote.create({ content, author, is_public, user_idx });
        res.status(201).json({ 
            message: 'Success to create quote',
            data: {
                id: quoteId,
                author: author,
                content: content,
                isPublic: is_public,
                userIdx: user_idx
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({ 
            message: 'Failed to create quote',
            error: errorMessage,
        });
    }
};

const deleteQuote = async (req: Request, res: Response<ApiResponse<QuoteData>>) => {
    try {
        const { id } = req.params;
        const success = await Quote.deleteById(Number(id));
        if (success) {
            res.status(200).json({
                message: 'Quote deleted successfully',
                data: {
                    id: Number(id),
                },
            });
        } else {
            res.status(404).json({ 
                message: 'Failed to delete quote',
                error: 'Quote not found',
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).json({
            message: 'Failed to delete quote',
            error: errorMessage,
        });
    }
};

const reportQuote = async (req: Request, res: Response<ApiResponse<QuoteData>>) => {
    const { id } = req.params;
    try {
        const reportsCount = await Quote.reportById(Number(id));
        if (reportsCount >= 10) {
            await Quote.updatePublicStatus(Number(id), false);
            res.status(200).send({
                message: 'The quote has been set to private.',
                data: {
                    id: Number(id),
                },
            });
        } else {
            res.status(200).send({
                message: 'Report has been registered.',
                data: {
                    id: Number(id),
                    reportsCount: reportsCount,
                },
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        res.status(500).send({
            message: 'Server error occurred.',
            error: errorMessage,
        });
    }
};

export { getAllPublicQuotes, createQuote, deleteQuote, reportQuote };
