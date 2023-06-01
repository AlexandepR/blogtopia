// import { Module } from "@nestjs/common";
// import { MongooseModule } from "@nestjs/mongoose";
// import { CommentsService } from "./comments.service";
// import { CommentsRepository } from "./comments.repository";
// import { UsersRepository } from "../users/users.repository";
// import { CommentsController } from "./comments.controller";
// import { Comment, CommentSchema } from "./type/comments.schema";
// import { JwtService } from "../auth/jwt.service";
// import { BlogsModule } from "../blogs/blogs.module";
// import { PostsModule } from "../posts/posts.module";
// import { Post, PostSchema } from "../posts/type/posts.schema";
// import { Blog, BlogSchema } from "../blogs/type/blogs.schema";
// import { UsersModule } from "../users/users.module";
// // import { PostsModule } from "../posts/posts.module";
//
//
// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       {
//         name: Comment.name,
//         schema: CommentSchema,
//       },
//       // {
//       //   name: Post.name,
//       //   schema: PostSchema,
//       // },
//       // {
//       //   name: Blog.name,
//       //   schema: BlogSchema,
//       // },
//     ]),
//     UsersModule,
//   ],
//   controllers: [CommentsController],
//   providers: [
//     JwtService,
//     CommentsService,
//     CommentsRepository,
//     UsersRepository,
//   ],
// })
// export class CommentsModule{}