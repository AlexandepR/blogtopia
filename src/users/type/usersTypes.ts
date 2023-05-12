// export type CreatePostInputModelType = {
//   name: string,
//   description: string,
//   websiteUrl: string,
// }
// export type PutPostInputModelType = {
//   name: string,
//   websiteUrl: string,
// }

export type ParamsUsersType = {
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string
  searchLoginTerm: string,
  searchEmailTerm: string,
}

export type UserType = {
  id: string,
  login: string,
  email: string,
  createdAt: string
}
export type CreateUserInputModelType = {
  login: string,
  email: string,
  password: string,
}