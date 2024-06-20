export interface PagedData<T> {
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  items: T[];
}