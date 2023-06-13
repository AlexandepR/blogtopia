import { Types } from "mongoose";


export const totalCountBanUsersForBlogFilter=(searchNameTerm: string, isBan: boolean, blogId: Types.ObjectId) => {
  return {
    $and: [
      {_id : blogId},
      {"banUsersInfo.banInfo.isBanned": true },
      // isBan ? { "banInfo.isBanned": true } : {},
      searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {}
    ]
  }
}