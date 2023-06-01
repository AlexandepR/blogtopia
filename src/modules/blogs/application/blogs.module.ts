// import { Module } from "@nestjs/common";
// import { MongooseModule } from "@nestjs/mongoose";
// import { Blog, BlogSchema } from "./type/blogs.schema";
// import { BlogsRepository } from "./blogs.repository";
// import { PostsRepository } from "../posts/posts.repository";
// import { JwtService } from "../auth/jwt.service";
// import { BlogsController } from "./blogs.controller";
// import { BlogsService } from "./blogs.service";
// import { Post, PostSchema } from "../posts/type/posts.schema";
// import { Comment, CommentSchema } from "../comments/type/comments.schema";
// import { UsersModule } from "../users/users.module";
// import { UsersRepository } from "../users/users.repository";
// import { PostsService } from "../posts/posts.service";
// import { User, UserSchema } from "../users/type/users.schema";
//
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       {
//         name: Blog.name,
//         schema: BlogSchema,
//       },
//       {
//         name: Post.name,
//         schema: PostSchema,
//       },
//       {
//         name: Comment.name,
//         schema: CommentSchema
//       },
//       {
//         name: User.name,
//         schema: UserSchema
//       },
//     ]),
//   ],
//   providers: [
//     BlogsRepository,
//     PostsRepository,
//     PostsService,
//     BlogsService,
//     JwtService,
//     UsersRepository
//   ],
//   controllers: [BlogsController],
// })
// export class BlogsModule{}