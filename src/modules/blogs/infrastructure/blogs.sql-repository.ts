import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BanInfoInputClassModel, BlogInputClassModel, BlogType, CreateBlogInputModelType } from '../type/blogsType';
import { ObjectId } from 'mongodb';
import { Post, PostModelType } from '../../posts/domain/posts.schema';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { FindUserType } from '../../users/type/usersTypes';

@Injectable()
export class BlogsSqlRepository {
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
        isAdmin?: boolean
    ): Promise<BlogDocument[]> {
        const getBlogOwnerInfo = isAdmin ? 'blogOwnerInfo' : '';
        const getBanInfo = isAdmin ? 'banInfo' : '';
        const blogs = await this.BlogModel
            .find(filter
                ,
                {
                    _id: 0,
                    id: '$_id',
                    'name': 1,
                    'description': 1,
                    'websiteUrl': 1,
                    'createdAt': 1,
                    'isMembership': 1
                }
            )
            .sort([[sortBy, sortDirection]])
            .skip(skip)
            .select([
                'name',
                'description',
                'websiteUrl',
                'createdAt',
                'isMembership',
                `${getBlogOwnerInfo}`,
                `${getBanInfo}`
            ])
            .limit(pageSize);
        return blogs;
    }
    async getBannedUsers(
        skip: number,
        pageSize: number,
        filter: any,
        sortBy: string,
        sortDirection: 'asc' | 'desc'
    ) {
        const blogs = await this.BlogModel
            .find(filter, { _id: 0, 'banUsersInfo': 1 })
            .select(['banUsersInfo'])
            .lean()
            .sort({ [`banUsersInfo.${sortBy}`]: sortDirection })
            .skip(skip)
            .limit(pageSize);
        if (blogs[0]) {
            const sortBlog = blogs[0].banUsersInfo.sort((a, b) => {
                if (sortDirection === 'asc') {
                    if (a.login < b.login) {
                        return -1;
                    } else if (a.login > b.login) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else if (sortDirection === 'desc') {
                    if (a.login > b.login) {
                        return -1;
                    } else if (a.login < b.login) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }).slice(0, pageSize);
            return sortBlog;
        }
        return blogs;
    }
    async createBlog(dto: CreateBlogInputModelType, user: FindUserType): Promise<BlogType> {
        const date = new Date().toISOString();
        const createQuery = `
        INSERT INTO public."Blogs" 
        (name, description, "websiteUrl", "BlogOwnerLogin", "BlogOwnerId", "createdAt")
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING "ID" as "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
    `;
        const values = [dto.name, dto.description, dto.websiteUrl, user.login, user.ID, date];
        return await this.dataSource.query(createQuery, values)
    }
    async updateBlog(dto: BlogInputClassModel, blogId: string): Promise<boolean> {
        const updateQuery = `
        UPDATE public."Blogs" b
        SET "name" = '${dto.name}', "description" = '${dto.description}', "websiteUrl" = '${dto.websiteUrl}'
        WHERE b."ID" = '${blogId}'
        `
        const result = await this.dataSource.query(updateQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }

    async findBlogById(blogId: ObjectId): Promise<BlogDocument> {
        const blog = await this.BlogModel
            .findOne({ _id: blogId });
        return blog;
    }
    async bindUserToBlog(blogId: string, user:FindUserType): Promise<boolean> {
        const updateQuery = `
        UPDATE public."Blogs" b
        SET 
        "BlogOwnerLogin" = '${user.login}',
        "BlogOwnerId" = '${user.ID}'
        WHERE b."ID" = '${blogId}'
        `
        const result = await this.dataSource.query(updateQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async updateBanStatusForBlog(banStatus: boolean, blogId: string):Promise<boolean> {
        const date = new Date().toISOString();
        const updateQuery = `
        UPDATE public."Blogs" b
        SET "isBanned" = '${banStatus}', "banDate" = '${date}'
        WHERE b."ID" = '${blogId}'
        `
        const result = await this.dataSource.query(updateQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async save(blog: BlogDocument) {
        return await blog.save();
    }
    async banUserForBlog (user: FindUserType, dto: BanInfoInputClassModel): Promise<boolean> {
        const date = new Date().toISOString();
        const createQuery = `
        INSERT INTO public."BanUsersBlogs"
        ("userLogin", "isBanned", "banDate", "banReason", "userId", "blogId")
	    VALUES
	    ($1, $2, $3, $4, $5, $6)
        `
        const values = [user.login, dto.isBanned, date, dto.banReason, user.ID, dto.blogId]
        return await this.dataSource.query(createQuery, values)
    }
    async deleteBanUserBlog (userId: string) {
        const delQuery = `
        DELETE FROM public."BanUsersBlogs" b
        WHERE b."userId" = '${userId}'
        `
        const result = await this.dataSource.query(delQuery)
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async deleteBlog(id: string): Promise<boolean> {
        const delQuery = `
        DELETE FROM public."Blogs" b
        WHERE b."ID" = '${id}'
        `
        const result = await this.dataSource.query(delQuery)
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async deleteAllBlogs(): Promise<boolean> {
        const delBlog = await this.BlogModel
            .deleteMany({});
        return delBlog.deletedCount >= 1;
    }
}