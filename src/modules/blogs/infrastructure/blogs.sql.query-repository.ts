import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../posts/domain/posts.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BanUsersBlogsType, BlogType } from '../type/blogsType';
import { GetBanUserForBlog } from '../../users/type/usersTypes';

@Injectable()
export class BlogsQuerySqlRepository {
    constructor(
        @InjectModel(Blog.name) private BlogModel: BlogModelType,
        @InjectModel(Post.name) private PostModel: PostModelType,
        @InjectDataSource() protected dataSource: DataSource
    ) {
    }
    async getBlogs(
        skip: number,
        pageSize: number,
        filter: any,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        searchNameTerm?: string,
        userId?: string
    ): Promise<BlogType[]> {
        const getQuery = `
    SELECT "ID" as "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    FROM public."Blogs" b
    ${filter}
    ORDER BY ${sortBy === 'createdAt' ? 'b."createdAt"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
    LIMIT ${pageSize}
    OFFSET ${skip}
    `;
        return await this.dataSource.query(getQuery);
    }
    async getBlogsByAdmin (
        skip: number,
        pageSize: number,
        filter: any,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        searchNameTerm?: string,
        userId?: string
    ): Promise<BlogType[]> {
        const getQuery = `
    SELECT "ID" as "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
    json_build_object (
        'userId', b."BlogOwnerId",
        'userLogin', b. "BlogOwnerLogin"
    ) as "blogOwnerInfo",
    json_build_object(
        'isBanned', b."isBanned",
        'banDate', b."banDate"
    ) as "banInfo"
    FROM public."Blogs" b
    ${filter}
    ORDER BY ${sortBy === 'createdAt' ? 'b."createdAt"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
    LIMIT ${pageSize}
    OFFSET ${skip}
    `;
        return await this.dataSource.query(getQuery);
    }
    async getBannedUsers(
        skip: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        searchLoginTerm: string,
        blogId: string
    ): Promise<GetBanUserForBlog> {
        let whereCondition = ''
        if (sortBy === 'login') {sortBy = 'userLogin'}
        if (searchLoginTerm) {
            whereCondition = ` AND LOWER(bu."userLogin") ILIKE LOWER('%${searchLoginTerm}%')`
        }
        const getQuery = `
        SELECT "ID" as id, bu."userLogin" as "login",
        json_build_object(
                        'isBanned', bu."isBanned",
                        'banDate', bu."banDate",
                        'banReason', bu."banReason"
        ) as "banInfo"
        FROM public."BanUsersBlogs" bu
        WHERE bu."blogId" = '${blogId}'
        ${whereCondition}
        ORDER BY ${sortBy === 'createdAt' ? 'bu."banDate"' : `bu."${sortBy}" COLLATE "C"`} ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${skip}
        `
        const result = await this.dataSource.query(getQuery);
        return result
    }
    async findBlogByAdmin(blogId: string): Promise<BlogType | null> {
        const findQuery = `
            SELECT *
            FROM public."Blogs" b
            WHERE b."ID" = '${blogId}'
        `;
        const findBlog = await this.dataSource.query(findQuery);
        if (findBlog.length > 0) return findBlog[0];
        return null;
    }
    async findBanUserForBlog(userId: string): Promise<BanUsersBlogsType | null> {
        const getQuery =  `
        SELECT *
        FROM public."BanUsersBlogs" b
        WHERE b."userId" = '${userId}'
        `
        const findUser = await this.dataSource.query(getQuery)
        if (findUser.length > 0) return findUser[0];
        return null;
        }
    async findBlogById(blogId: string): Promise<BlogType> {
        const findQuery = `
            SELECT *
            FROM public."Blogs" b
            WHERE b."ID" = '${blogId}'
                AND b."isBanned" != true
                AND NOT EXISTS (
                    SELECT 1
                    FROM public."BanUserInfo" ub
                    WHERE ub."isBanned" = true
                    AND ub."userId" = b."BlogOwnerId"
                )
        `;
        const findBlog = await this.dataSource.query(findQuery);
        if (findBlog.length > 0) return findBlog[0];
        return null;
    }
    async save(blog: BlogDocument) {
        return await blog.save();
    }
    async getTotalCountBanUsersBlogs(blogId: string, searchLoginTerm: string): Promise<number> {
        let whereCondition = '';
        const parameters = [blogId];
        if (searchLoginTerm) {
            whereCondition = 'AND LOWER(bb."userLogin") ILIKE LOWER($2)';
            parameters.push(`%${searchLoginTerm}%`);
        }
        const getQuery = `
            SELECT COUNT(*)
            FROM public."BanUsersBlogs" bb
            WHERE bb."blogId" = $1
            AND bb."isBanned" = true
            ${whereCondition}
        `;
        const result = await this.dataSource.query(getQuery, parameters);
        const count = parseInt(result[0].count, 10);
        return count;
    }
    async getTotalCountPublicBlogs (filter:string){
        const getCountBlogsQuery = `
            SELECT *
            FROM public."Blogs" b
            ${filter}
            `;
        const count = await this.dataSource.query(getCountBlogsQuery);
        return count.length;
    }
    async getTotalCountBlogs(searchNameTerm: string, userId?: string): Promise<number> {
        let whereCondition = '';
        if (searchNameTerm) {
            whereCondition = `AND LOWER(b."name") ILIKE LOWER('%${searchNameTerm}%')`;
        }
        const getCountBlogsQuery = `
            SELECT b.*
            FROM public."Blogs" b
            WHERE b."BlogOwnerId" = '${userId}'
            ${whereCondition}
            `;
        const count = await this.dataSource.query(getCountBlogsQuery);
        return count.length;
    }
    async getTotalBlogsByAdmin(searchNameTerm: string): Promise<number> {
        let whereCondition = '';
        if(searchNameTerm) {whereCondition = `WHERE LOWER(b."name") ILIKE LOWER('%${searchNameTerm}%')`;}
        const getCountBlogsQuery = `
                SELECT COUNT(*) AS "totalBlogs"
                FROM public."Blogs" b
                ${whereCondition}
            `;
        const result = await this.dataSource.query(getCountBlogsQuery);
        const totalBlogs = result[0]?.totalBlogs || 0;
        return +totalBlogs;
    }
}