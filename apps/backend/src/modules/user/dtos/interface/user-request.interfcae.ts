export interface UserPaginationRequestOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  role?: string;
  status?: string;
  excludeUserUuid?: string;
  currentUserRole?: string;
}
