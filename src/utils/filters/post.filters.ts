export const getPostByIdFilter = (banUsers, getBanBlogs) => {
  return {
    $and: [
      banUsers ? { "postOwnerInfo.userLogin": { $nin: banUsers } } : {},
      getBanBlogs ? { "blogId": { $nin: getBanBlogs } } : {}
    ]
  };
};
export const getPostsPublicFilter = (banUsers, banBlogs, searchNameTerm) => {
  return {
    $and: [
      banUsers ? { "postOwnerInfo.userLogin": { $nin: banUsers } } : {},
      banBlogs ? { "blogId": { $nin: banBlogs } } : {},
      searchNameTerm ? { name: { $regex: `${searchNameTerm}`, $options: "i" } } : {}
    ]
  }
}
export const getPostsByBlogFilter = (getBanBlogs, banUsers) => {
  return {
    and$: [
      getBanBlogs ? { "blogId" : { $nin: getBanBlogs } } : {},
      banUsers ? {"postOwnerInfo.userLogin": { $nin: banUsers } } : {}
    ]}
}