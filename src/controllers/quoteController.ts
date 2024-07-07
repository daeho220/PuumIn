import { Request, Response } from 'express';
import { ApiResponse } from '../types/apiResponse';
import { PagedData } from '../types/pagedData';
import { QuoteData } from '../types/quoteData';
import logMessage from '../config/logger';

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

        logMessage({code:200, msg:""});
        res.status(200).json({
            success: true,
            data: {
                currentPage: page,
                totalPages: totalPages,
                totalItemCount: totalItemCount,
                items: data
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:500, msg:`Error: ${errorMessage}`});

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
};

const createQuote = async (req: Request, res: Response<ApiResponse<QuoteData>>) => {
    try {
        const { content, isPublic } = req.body;
        const userIdx = parseInt(req.userIdx as string);
        if (isNaN(userIdx)) { // userIdx가 숫자가 아닌 경우 오류 처리
            logMessage({code:501, msg:""});

            return res.status(400).json({
                success: false,
                error: 'Invalid user index',
            });
        }
        const quoteId = await Quote.create({ content, isPublic, userIdx });
        
        logMessage({code:201, msg:""});
        res.status(201).json({ 
            success: true,
            data: {
                id: quoteId,
                content: content,
                isPublic: isPublic,
                userIdx: userIdx
            }
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:502, msg:`Error: ${errorMessage}`});

        res.status(500).json({ 
            success: false,
            error: errorMessage,
        });
    }
};

const deleteQuote = async (req: Request, res: Response<ApiResponse<QuoteData>>) => {
    try {
        const { id } = req.params;
        const success = await Quote.deleteById(Number(id));
        if (success) {
            logMessage({code:202, msg:`QuoteId: ${id}`});
            res.status(200).json({
                success: true,
                data: {
                    id: Number(id),
                },
            });
        } else {
            logMessage({code:503, msg:`QuoteId: ${id}`});
            res.status(404).json({ 
                success: false,
                error: 'Quote not found',
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:502, msg:`Error: ${errorMessage}`});

        res.status(500).json({
            success: false,
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

            logMessage({code:203, msg:`QuoteId: ${Number(id)}, reportsCount: ${reportsCount}`});
            res.status(200).send({
                success: true,
                data: {
                    id: Number(id),
                },
            });
        } else {
            logMessage({code:204, msg:`QuoteId: ${Number(id)}, reportsCount: ${reportsCount}`});
            res.status(200).send({
                success: true,
                data: {
                    id: Number(id),
                    reportsCount: reportsCount,
                },
            });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.toString() : 'Unknown error';
        logMessage({code:502, msg:`Error: ${errorMessage}`});

        res.status(500).send({
            success: false,
            error: errorMessage,
        });
    }
};

export { getAllPublicQuotes, createQuote, deleteQuote, reportQuote };
