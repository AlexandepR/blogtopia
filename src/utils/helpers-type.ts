
export type PaginationQueryType = {
  term: string | null
  pageSize: number
  pageNumber: number
  sortDirection: 'asc' | 'desc'
  sortBy: string
}