
export type PaginationQueryType = {
  searchNameTerm: string | null
  pageSize: number
  pageNumber: number
  sortDirection: 'asc' | 'desc'
  sortBy: string
}