// import { PostsController } from "../posts/posts.controller";
// import { PostsService } from "../posts/posts.service";
// import { PostsRepository } from "../posts/posts.repository";
// import { UsersRepository } from "../users/users.repository";
// import { CommentsRepository } from "../comments/comments.repository";
// import { Post, PostSchema } from "../posts/type/posts.schema";
// import { Comment, CommentSchema } from "../comments/type/comments.schema";
// import { Module } from "@nestjs/common";
// import { MongooseModule } from "@nestjs/mongoose";
// import { JwtService } from "../auth/jwt.service";
// import { BlogsModule } from "../blogs/blogs.module";
// import { CommentsModule } from "../comments/comments.module";
// import { BlogsRepository } from "../blogs/blogs.repository";
// import { SecurityController } from "./security.controller";
// import { SecurityRepository } from "./security.repository";
// import { Security, SecuritySchema } from "./type/security.schema";
// import { SecurityService } from "./security.service";
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([{
//         name: Security.name,
//         schema: SecuritySchema
//       }]),
//     ],
//   controllers: [SecurityController],
//   providers: [
//     SecurityRepository,
//     SecurityService
//   ],
// })
// export class SecurityModule {
// }