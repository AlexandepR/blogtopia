import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/posts.schema';
import {
    CreatePostForBlogInputClassModel,
    CreatePostInputModelType,
    likeStatusInputClassModel,
    PostType
} from '../type/postsType';
import { Comment, CommentModelType } from '../../comments/domain/comments.schema';
import { User, UserModelType } from '../../users/domain/entities/users.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogType } from '../../blogs/type/blogsType';
import { FindUserType } from '../../users/type/usersTypes';
import { CommentType } from '../../comments/type/commentsType';

@Injectable()
export class PostsSqlRepository {
    constructor(
        @InjectModel(Post.name) private PostModel: PostModelType,
        @InjectModel(Comment.name) private CommentModel: CommentModelType,
        @InjectModel(User.name) private UserModel: UserModelType,
        @InjectDataSource() protected dataSource: DataSource
    ) {
    }
    async getPostsByBlogs(
        skip: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        blogId?: string,
        user?: FindUserType
    ): Promise<any> {
        console.log(sortDirection,'sortDirection');
        console.log(sortBy,'sortBy');
        let userId = '';
        let whereCondition = '';
        if (user) {
            userId = user.ID;
            whereCondition = `
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostLikesData" pld
                        WHERE pld."postId" = p."ID"
                        AND pld."userId" = '${userId}'
                    ) THEN 'Like'
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostDislikesData" pdld
                        WHERE pdld."postId" = p."ID"
                        AND pdld."userId" = '${userId}'
                    ) THEN 'Dislike'
                      ELSE 'None'
                 END`
        }
        const getQuery = `
        SELECT p."ID" as id, p."title", p."shortDescription", p."content",
        p."blogId", p."blogName", p."createdAt",
        json_build_object(
                'likesCount',
                 (
                    SELECT COUNT(*) 
                    FROM public."PostLikesData" pld
                    WHERE pld."postId" = p."ID"
                ),
                'dislikesCount',
                (
                    SELECT COUNT(*) 
                    FROM public."PostDislikesData" pdld
                    WHERE pdld."postId" = p."ID"
                ),
                'myStatus', ${ whereCondition ? whereCondition : "'None'"},
                 'newestLikes', (
                        SELECT json_agg(
                        json_build_object(
                            'addedAt', pld."addedAt",
                            'userId', pld."userId",
                            'login', pld."login"
                            )
                        )
                        FROM (
                            SELECT 
                                pld."addedAt",
                                pld."userId",
                                pld."login"
                            FROM public."PostLikesData" pld
                            WHERE pld."postId" = p."ID"
                            ORDER BY pld."addedAt" DESC
                            LIMIT 3
                    ) AS pld
                )
            ) as "extendedLikesInfo"
        FROM public."Posts" p
        JOIN public."Blogs" b ON p."blogId" = b."ID"
        WHERE p."blogId" =  '${blogId}'
        AND NOT EXISTS (
                    SELECT 1
                    FROM public."BanUserInfo" ub
                    WHERE ub."isBanned" = true
                    AND ub."userId" = b."BlogOwnerId"
                    AND p."blogId" = '${blogId}'
                )
    ORDER BY ${sortBy === 'createdAt' ? 'p."createdAt"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
    LIMIT ${pageSize}
    OFFSET ${skip}
    `;
        const result = await this.dataSource.query(getQuery);
        result.map((el) => {if (!el.extendedLikesInfo.newestLikes) {
            el.extendedLikesInfo.newestLikes = [];
        }return el})
        return result;
    }
    async getPosts(
        skip: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        // blogId?: string,
        user?: FindUserType
    ): Promise<any> {
        let userId = '';
        let whereCondition = ''
        if (user) {
            userId = user.ID;
            whereCondition = `
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostLikesData" pld
                        WHERE pld."postId" = p."ID"
                        AND pld."userId" = '${userId}'
                    ) THEN 'Like'
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostDislikesData" pdld
                        WHERE pdld."postId" = p."ID"
                        AND pdld."userId" = '${userId}'
                    ) THEN 'Dislike'
                      ELSE 'None'
                 END`
        }
        const getQuery = `
        SELECT p."ID" as id, p."title", p."shortDescription", p."content",
        p."blogId", p."blogName", p."createdAt",
        json_build_object(
                'likesCount',
                 (
                    SELECT COUNT(*) 
                    FROM public."PostLikesData" pld
                    WHERE pld."postId" = p."ID"
                ),
                'dislikesCount',
                (
                    SELECT COUNT(*) 
                    FROM public."PostDislikesData" pdld
                    WHERE pdld."postId" = p."ID"
                ),
                'myStatus', ${ whereCondition ? whereCondition : "'None'"},
                 'newestLikes', (
                        SELECT json_agg(
                        json_build_object(
                            'addedAt', pld."addedAt",
                            'userId', pld."userId",
                            'login', pld."login"
                            )
                        )
                        FROM (
                            SELECT 
                                pld."addedAt",
                                pld."userId",
                                pld."login"
                            FROM public."PostLikesData" pld
                            WHERE pld."postId" = p."ID"
                            ORDER BY pld."addedAt" DESC
                            LIMIT 3
                    ) AS pld
                )
            ) as "extendedLikesInfo"
        FROM public."Posts" p
        JOIN public."Blogs" b ON p."blogId" = b."ID"
        WHERE NOT EXISTS (
                    SELECT 1
                    FROM public."BanUserInfo" ub
                    WHERE ub."isBanned" = true
                    AND ub."userId" = b."BlogOwnerId"
                )
    ORDER BY ${sortBy === 'createdAt' ? 'p."createdAt"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
    LIMIT ${pageSize}
    OFFSET ${skip}
    `;
        const result = await this.dataSource.query(getQuery);
        result.map((el) => {if (!el.extendedLikesInfo.newestLikes) {
            el.extendedLikesInfo.newestLikes = [];
        }return el})
        return result;
    }
    async createPost(dto: CreatePostInputModelType, blog: BlogType, user: FindUserType): Promise<PostType> {
        const date = new Date().toISOString();
        const createPostQuery = `
    INSERT INTO public."Posts"
    ( title, "shortDescription", content, "blogName", "postOwnerLogin", "postOwnerId", "createdAt", "blogId")
     VALUES
     ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *
    `;
        const values = [dto.title, dto.shortDescription, dto.content, blog.name, user.login, user.ID, date, blog.ID];
        const post = await this.dataSource.query(createPostQuery, values);
        return post[0];
    }
    async createComment(
        content: string,
        postId: string,
        user: FindUserType): Promise<CommentType> {
        const date = new Date().toISOString();
        const createQuery = `
            INSERT INTO public."Comments"
            ( content, "createdAt", "commentatorId", "commentatorLogin", "postId" )
            VALUES
            ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [content, date, user.ID, user.login, postId];
        const comment = await this.dataSource.query(createQuery, values);
        return comment[0];
    }
    async findPostById(postId: string): Promise<PostType | null> {
        const getQuery = `
        SELECT *
        FROM public."Posts" p
        JOIN public."Blogs" b ON b."ID" = p."blogId"
        WHERE p."ID" = '${postId}'
            AND NOT EXISTS (
                SELECT 1
                FROM public."BanUserInfo" ub
                WHERE ub."isBanned" = true
                AND ub."userId" = b."BlogOwnerId"
                AND p."blogId" = b."ID"
            )
        `;
        const post = await this.dataSource.query(getQuery);
        if (post.length > 0) return post[0];
        return null;
    }
    async findPostByIdForBlogger(postId: string, userId?: string): Promise<PostType | null> {
        let getQuery = `
        SELECT p."ID" as id, p."title", p."shortDescription", p."content",
        p."blogId", p."blogName", p."createdAt",
        json_build_object(
            'likesCount', 
                (
                SELECT COUNT(*)
                FROM public."PostLikesData" pld
                WHERE pld."postId" = '${postId}'
                ),
            'dislikesCount', 
                (
                SELECT COUNT(*)
                FROM public."PostDislikesData" pdld
                WHERE pdld."postId" = '${postId}'
                ),
             'myStatus',
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostLikesData" pld
                        WHERE pld."postId" = '${postId}'
                        AND pld."userId" = '${userId}'
                    ) THEN 'Like'
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."PostDislikesData" pdld
                        WHERE pdld."postId" = '${postId}'
                        AND pdld."userId" = '${userId}'
                    ) THEN 'Dislike'
                      ELSE 'None'
                 END,
                 'newestLikes', (
            SELECT json_agg(
                json_build_object(
                    'addedAt', pld."addedAt",
                    'userId', pld."userId",
                    'login', pld."login"
                     )
                 )
                FROM (
                    SELECT
                        pld."addedAt",
                        pld."userId",
                        pld."login"
                    FROM public."PostLikesData" pld
                    WHERE pld."postId" = p."ID"
                    ORDER BY pld."addedAt" DESC
                    LIMIT 3
                    ) AS pld
                )
            ) AS "extendedLikesInfo"
        FROM public."Posts" p
        JOIN public."Blogs" b ON b."ID" = p."blogId"
        WHERE p."ID" = '${postId}'
        AND b."isBanned" = false
        AND NOT EXISTS (
            SELECT 1
            FROM public."BanUserInfo" bu
            WHERE bu."isBanned" = true
            AND bu."userId" = b."BlogOwnerId"
            AND p."blogId" = b."ID" 
        )
       `;
        const getPost = await this.dataSource.query(getQuery);
        if (!getPost[0].extendedLikesInfo.newestLikes ) getPost[0].extendedLikesInfo.newestLikes = [];
        if (getPost.length > 0) return getPost[0];
        return null;
    }
    async getTotalCountPosts(): Promise<number> {
        const getCountBlogsQuery = `
        SELECT p.*
        FROM public."Posts" p
        WHERE NOT EXISTS (
            SELECT 1
            FROM public."BanUserInfo" ub
            JOIN public."Blogs" b ON ub."userId" = b."BlogOwnerId"
            WHERE ub."isBanned" = true
            AND ub."userId" = b."BlogOwnerId"
            AND p."blogId" = b."ID"
        )
    `;
        const count = await this.dataSource.query(getCountBlogsQuery);
        return count.length;
    }
    async getTotalCountPostsByBlog(blogId: string): Promise<number> {
        console.log('tyta');
        const getCountBlogsQuery = `
                 SELECT p.*
                 FROM public."Posts" p
                 JOIN public."Blogs" b ON b."ID" = p."blogId"
                 WHERE p."blogId" = '${blogId}'
                     AND b."isBanned" != true
                     AND NOT EXISTS (
                                     SELECT 1
                                     FROM public."BanUserInfo" ub
                                     WHERE ub."isBanned" = true
                                     AND ub."userId" = b."BlogOwnerId"
                                    )
                 `;
        const count = await this.dataSource.query(getCountBlogsQuery);
        return count.length;
    }
    async save(post: PostDocument) {
        await post.save();
    }
    async updatePost(postId: string, dto: CreatePostForBlogInputClassModel): Promise<boolean> {
        const updateQuery = `
        UPDATE public."Posts" p
        SET 
        "title" = '${dto.title}',
        "shortDescription" = '${dto.shortDescription}',
        "content" = '${dto.content}'
        WHERE p."ID" = '${postId}'        
        `;
        const result = await this.dataSource.query(updateQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async createPostLikesInfo(userId: string, userLogin: string, postId: string, dto: likeStatusInputClassModel): Promise<boolean> {
        const date = new Date().toISOString();
        const likesData = dto.likeStatus === 'Like' ? "PostLikesData" : "PostDislikesData"
        const delData = dto.likeStatus !== 'Like' ? "PostLikesData" : "PostDislikesData"
        const isExistQuery = `
            SELECT 1
            FROM public."${likesData}"
            WHERE "userId" = '${userId}' AND  "postId" = '${postId}'
        `
        const isExist = await this.dataSource.query(isExistQuery);
        if (isExist.length > 0) { return true }
        const delQuery = `
            DELETE
            FROM public."${delData}" pld
            WHERE pld."postId" = '${postId}'
            AND pld."userId" = '${userId}'
        `
        await this.dataSource.query(delQuery);
        const createQuery = `
            INSERT INTO public."${likesData}"
            ("addedAt", "userId", login, "postId")
            VALUES
            ($1, $2, $3, $4)
            RETURNING *
          `
        const values = [date, userId, userLogin, postId]
        const result = await this.dataSource.query(createQuery,values)
        return result[0]
    }
    async deleteLikesStatus(userId: string, postId: string):Promise<boolean>{
        const delQuery = `
            DELETE FROM public."PostLikesData"
            WHERE "postId" = '${postId}' AND "userId" = '${userId}';

            DELETE FROM public."PostDislikesData"
            WHERE "postId" = '${postId}' AND "userId" = '${userId}';
        `;
        try {
            await this.dataSource.query(delQuery);
            return true;
        } catch (error) {
            return false;
        }
    }
    async delete(id: string): Promise<boolean> {
        const delQuery = `
        DELETE FROM public."Posts" p
        WHERE p."ID" = '${id}'
        `;
        const result = await this.dataSource.query(delQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
}
