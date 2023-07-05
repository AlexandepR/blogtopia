import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Post, PostModelType } from '../../posts/domain/posts.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogType } from '../type/blogsType';
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
    async getArrayIdBanBlogs() {
        const blogs = await this.BlogModel
            .find({ 'banInfo.isBanned': true });
        const arrBlogsId = blogs.map((blog) => blog._id);
        return arrBlogsId;
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
        if (searchLoginTerm) {
            whereCondition = ` AND LOWER(bu."userLogin") ILIKE LOWER('%${searchLoginTerm}%')`
        }
        const getQuery = `
        SELECT "ID" as "id", "userLogin" as "login",
        json_build_object(
                        'isBanned', bu."isBanned",
                        'banDate', bu."banDate",
                        'banReason', bu."banReason"
        ) as "banInfo"
        FROM public."BanUsersBlogs" bu
        WHERE bu."blogId" = '${blogId}'
        ${whereCondition}
        ORDER BY ${sortBy === 'createdAt' ? 'bu."banDate"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${skip}
        `
        return await this.dataSource.query(getQuery);
    }
    async findBlogByIdForBlogger(blogId: ObjectId, filter?): Promise<BlogDocument> {
        const query = { $and: [{ _id: blogId }, filter] };
        const blog = await this.BlogModel
            .findOne(query);
        return blog;
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
        // ${whereCondition}
        // WHERE b."isBanned" != true
        // AND LOWER(b."name") ILIKE LOWER('%${searchNameTerm}%')
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