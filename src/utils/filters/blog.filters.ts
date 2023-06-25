export const GetBlogsPublicFilter = (banUsers, banBlogs, searchNameTerm) => {
  return {
    $and: [
      banUsers ? { "blogOwnerInfo.userLogin": { $nin: banUsers } } : {},
      banBlogs ? { "_id" : { $nin: banBlogs } } : {},
      searchNameTerm ? { name: { $regex: `${searchNameTerm}`, $options: "i" } } : {}
    ]
  };
};