export interface QuoteData {
  id: number;
  content?: string;
  author?: string;
  isPublic?: boolean;
  userIdx?: number;
  createdAt?: string;
  updatedAt?: string;
  reportsCount?: number;
}