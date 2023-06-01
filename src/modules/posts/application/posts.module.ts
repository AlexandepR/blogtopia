// import { PostsController } from "./posts.controller";
// import { PostsService } from "./posts.service";
// import { PostsRepository } from "./posts.repository";
// import { UsersRepository } from "../users/users.repository";
// import { CommentsRepository } from "../comments/comments.repository";
// import { Post, PostSchema } from "./type/posts.schema";
// import { Comment, CommentSchema } from "../comments/type/comments.schema";
// import { Module } from "@nestjs/common";
// import { MongooseModule } from "@nestjs/mongoose";
// import { JwtService } from "../auth/jwt.service";
// import { BlogsModule } from "../blogs/blogs.module";
// import { CommentsModule } from "../comments/comments.module";
// import { BlogsRepository } from "../blogs/blogs.repository";
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([{
//       name: Post.name,
//       schema: PostSchema,
//     },
//     {
//       name: Comment.name,
//       schema: CommentSchema,
//     }
//     ]),
//     // BlogsModule,
//   ],
//   controllers: [PostsController],
//   providers: [
//     JwtService,
//     PostsService,
//     PostsRepository,
//     BlogsRepository,
//     UsersRepository,
//     CommentsRepository,
//   ],
//   // exports: [PostsModule]
// })
// export class PostsModule{}