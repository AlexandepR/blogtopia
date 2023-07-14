import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comments.schema';
import { CommentDataType } from '../type/commentsType';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { likeStatusInputClassModel } from '../../posts/type/postsType';


@Injectable()
export class CommentsSqlRepository {
    constructor(
        @InjectModel(Comment.name) private CommentModel: CommentModelType,
        @InjectDataSource() protected dataSource: DataSource
    ) {
    }
    async getComments(
        postId: string,
        pageSize: number,
        skip: number,
        sortBy: string,
        sortDirection: 'desc' | 'asc',
        userId?: string
    ): Promise<CommentDataType[]> {
        let whereCondition = ''
        if (userId) {
            whereCondition = `
             CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM public."CommentLikesData" cld
                    WHERE cld."commentId" = c."ID"
                    AND cld."userId" = '${userId}'
                ) THEN 'Like'
                WHEN EXISTS (
                    SELECT 1
                    FROM public."CommentDislikesData" cdd
                    WHERE cdd."commentId" = c."ID"
                    AND cdd."userId" = '${userId}'
                ) THEN 'Dislike'
                  ELSE 'None'
            END `
        }
        const getQuery = `
        SELECT c."ID" as id, c."content",
        json_build_object(
             'userId', c."commentatorId",
             'userLogin', c."commentatorLogin"
        ) as "commentatorInfo",
        c."createdAt",
        json_build_object(
            'likesCount', 
            (
            SELECT COUNT(*)
            FROM public."CommentLikesData" cld
            WHERE cld."commentId" = c."ID"
            ),
            'dislikesCount',
            (
            SELECT COUNT(*)
            FROM public."CommentDislikesData" cdd
            WHERE cdd."commentId" = c."ID"
            ),
            'myStatus', ${ whereCondition ? whereCondition : "'None'"}
           ) as "likesInfo"
        FROM public."Comments" c
        JOIN public."Posts" p ON p."ID" = $1
        JOIN public."Blogs" b ON b."ID" = p."blogId"
        WHERE c."postId" = '${postId}'
        AND NOT EXISTS (
                SELECT 1
                 FROM public."BanUserInfo" bu
                 WHERE bu."isBanned" = true
                 AND bu."userId" = b."BlogOwnerId" 
                 AND p."blogId" = b."ID"
                 AND c."postId" = p."ID"
                )
        ORDER BY ${sortBy === 'createdAt' ? 'c."createdAt"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${skip}
    `;
        return await this.dataSource.query(getQuery, [postId]);
    }
    async getCommentById(commentId: string, id?: string): Promise<CommentDataType | null> {
        let whereCondition = ''
        let userId = ''
        if (id) {
            userId = id;
            whereCondition = `
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."CommentLikesData" cld
                        WHERE cld."commentId" = c."ID"
                        AND cld."userId" = '${userId}'
                    ) THEN 'Like'
                    WHEN EXISTS (
                        SELECT 1
                        FROM public."CommentDislikesData" cdd
                        WHERE cdd."commentId" = c."ID"
                        AND cdd."userId" = '${userId}'
                    ) THEN 'Dislike'
                      ELSE 'None'
                 END`
        }
        const getQuery = `
            SELECT c."ID" as id, c."content",
            json_build_object (
                 'userId', c."commentatorId",
                 'userLogin', c."commentatorLogin"
            ) as "commentatorInfo",
             c."createdAt",
            json_build_object (
                'likesCount', (
                    SELECT COUNT(*)
                    FROM public."CommentLikesData" cld
                    WHERE cld."commentId" = c."ID"
                        AND NOT EXISTS (
                                    SELECT 1
                                    FROM public."BanUserInfo" bu
                                    WHERE bu."userId" = cld."userId"::uuid 
                                    AND bu."isBanned" = true
                        )
                    ),
                'dislikesCount',
                    (
                    SELECT COUNT(*)
                    FROM public."CommentDislikesData" cdd
                    WHERE cdd."commentId" = c."ID"
                        AND NOT EXISTS (
                                    SELECT 1
                                    FROM public."BanUserInfo" bu
                                    WHERE bu."userId" = cdd."userId"::uuid 
                                    AND bu."isBanned" = true
                        )
                    ),
                'myStatus', ${ whereCondition ? whereCondition : "'None'"}
                    ) as "likesInfo"  
            FROM public."Comments" c
            WHERE c."ID" = '${commentId}'
            AND NOT EXISTS (
                            SELECT 1
                            FROM public."BanUserInfo" bu
                            WHERE (bu."isBanned" = true AND c."commentatorId"::uuid = bu."userId")
                        )
            AND NOT EXISTS (
                            SELECT 1
                            FROM public."Blogs" b
                            LEFT JOIN public."Posts" p ON p."blogId" = b."ID"
                            LEFT JOIN public."Comments" c ON c."postId" = p."ID"
                            WHERE (b."isBanned" = true)
                        )
        `;
        const result = await this.dataSource.query(getQuery);
        return result[0] || null;
    }
    async getTotalCount(postId: string) {
        const getQuery = `
            SELECT COUNT(*)
            FROM public."Comments" c
            JOIN public."Posts" p ON p."ID" = $1
            JOIN public."Blogs" b ON b."ID" = p."blogId"
            WHERE c."postId" = $1
            AND NOT EXISTS (
                 SELECT 1
                 FROM public."BanUserInfo" bu
                 WHERE bu."isBanned" = true
                 AND bu."userId" = b."BlogOwnerId" 
                 AND p."blogId" = b."ID"
                 AND c."postId" = p."ID"
            )
      `;
        const result = await this.dataSource.query(getQuery, [postId]);
        const count = parseInt(result[0].count, 10);
        return count;
    }
    async createCommentLikesData(userId: string, userLogin: string, commentId: string, dto: likeStatusInputClassModel): Promise<boolean> {
        const date = new Date().toISOString();
        const likesData = dto.likeStatus === 'Like' ? "CommentLikesData" : "CommentDislikesData"
        const delData = dto.likeStatus !== 'Like' ? "CommentLikesData" : "CommentDislikesData"
        const isExistQuery = `
            SELECT 1
            FROM public."${likesData}"
            WHERE "userId" = '${userId}' AND  "commentId" = '${commentId}'
        `
        const isExist = await this.dataSource.query(isExistQuery);
        if (isExist.length > 0) { return true }
        const delQuery = `
            DELETE
            FROM public."${delData}" pld
            WHERE pld."commentId" = '${commentId}'
            AND pld."userId" = '${userId}'
        `
        await this.dataSource.query(delQuery);
        const createQuery = `
            INSERT INTO public."${likesData}"
            ("addedAt", "userId", login, "commentId")
            VALUES
            ($1, $2, $3, $4)
            RETURNING *
          `
        const values = [date, userId, userLogin, commentId]
        const result = await this.dataSource.query(createQuery,values)
        return result[0]
    }
    async deleteLikesStatus(userId: string, commentId: string):Promise<boolean>{
        const delQuery = `
            DELETE FROM public."CommentLikesData"
            WHERE "commentId" = '${commentId}' AND "userId" = '${userId}';

            DELETE FROM public."CommentDislikesData"
            WHERE "commentId" = '${commentId}' AND "userId" = '${userId}';
        `;
        try {
            await this.dataSource.query(delQuery);
            return true;
        } catch (error) {
            return false;
        }
    }
    async updateCommentId(id: string, content: string): Promise<boolean> {
        const updateQuery = `
        UPDATE public."Comments" c
        SET
        "content" = '${content}'
        WHERE c."ID" = '${id}'
        RETURNING *
        `;
        try {
            await this.dataSource.query(updateQuery);
            return true;
        } catch (err) {
            return false;
        }
    }
    async deleteComment(id: string): Promise<boolean> {
        const delQuery = `
        DELETE
        FROM public."Comments" c
        WHERE c."ID" = '${id}'
        `;
        try {
            await this.dataSource.query(delQuery);
            return true;
        } catch (error) {
            return false;
        }
    }
}