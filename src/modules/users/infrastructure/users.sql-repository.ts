import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostModelStaticType, PostModelType } from '../../posts/type/posts.schema';
import { CreateBlogInputModelType } from '../../blogs/type/blogsType';
import { Blog, BlogDocument } from '../../blogs/domain/entities/blogs.schema';
import { CreatePostInputModelType } from '../../posts/type/postsType';
import { ObjectId } from 'mongodb';
import { User, UserDocument, UserModelType } from '../domain/entities/users.schema';
import { CreateUserInputModelType, GetUsersOutputModelType } from '../type/usersTypes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSqlRepository {
    constructor(
        @InjectModel(User.name)
        private UserModel: UserModelType,
        @InjectDataSource()
        protected dataSource: DataSource) {
    }
    async getUsers(
        skip: number,
        pageSize: number,
        filter: string,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        banFilterStatus?: boolean,
    )
    : Promise<any>
    {
        const selectQuery = `
            SELECT u."ID" as id, u."login", u."email", u."created_at" as "createdAt",
            json_build_object(
                'isBanned', b."isBanned",
                'banDate', b."banDate",
                'banReason', b."banReason"
            ) as "banInfo"
            FROM public."Users" u
            LEFT JOIN public."BanUserInfo" b
            ON b."userId" = u."ID"
            ${filter}
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${skip}
        `;
        const users = await this.dataSource.query(selectQuery);
        return users
    }
    async getTotalCountUsers(filter: any, banStatus?: boolean): Promise<number> {
        const countQuery = `
        SELECT u.*, b."isBanned"
        FROM public."Users" u
        LEFT JOIN public."BanUserInfo" b
        ON b."userId" = u."ID"
        ${filter}
        `
        const count = await this.dataSource.query(countQuery)
        return count.length;
    }
    async getBannedUsers(): Promise<Array<string>> {
        const getBannedUsers = await this.UserModel
            .find({ 'accountData.banInfo.isBanned': true })
            .select(['_id', 'accountData.login']);
        const bannedUserLogin = getBannedUsers.map(user => user.accountData.login.toString());
        return bannedUserLogin;
    }
    async createUser(
        userDto: CreateUserInputModelType,
        passwordHash: string,
        ip: any,
        isConfirmEmail: boolean
    ): Promise<UserDocument> {
        const date = new Date().toISOString();
        const insertQuery = `
            WITH inserted_user AS (
            INSERT INTO public."Users" (login, email, created_at, "passwordHash", "isConfirmed")
            VALUES ('${userDto.login}', '${userDto.email}', '${date}', '${passwordHash}', '${isConfirmEmail}')
            RETURNING *
        ),
            inserted_ban_user AS (
            INSERT INTO public."BanUserInfo" ("userId", "banDate")
            SELECT "ID", '${date}' as "banDate"
            FROM inserted_user
            RETURNING * 
        ),  
            inserted_user_device_session AS (
            INSERT INTO public."UsersDevicesSessions" ("userId")
            SELECT "ID"
            FROM inserted_user
            RETURNING *
            )
              SELECT
            inserted_user."ID" as "id",
            inserted_user.login,
            inserted_user.email,
            inserted_user.created_at as "createdAt",
            json_build_object(
                'isBanned', inserted_ban_user."isBanned",
                'banDate', TO_CHAR(inserted_ban_user."banDate", 'YYYY-MM-DD"T"HH24:MI:SS.MSZ'),
                'banReason', inserted_ban_user."banReason"
            ) as "banInfo"
            FROM inserted_user
            LEFT JOIN inserted_ban_user ON inserted_user."ID" = inserted_ban_user."userId";
  `;
        const createUser = await this.dataSource.query(insertQuery);
        return createUser;
    }
    async findUserById(id: Types.ObjectId): Promise<UserDocument> {
        return this.UserModel
            .findOne({ _id: id });
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        const findUserQuery = `
               SELECT *
               FROM public."Users"
               WHERE login = '${loginOrEmail}' OR email = '${loginOrEmail}'
        `
        const findUser = await this.dataSource.query(findUserQuery)
        if (findUser.length > 0) return findUser[0];
        return null;
    }
    async findByConfirmationCode(emailConfirmationCode: string)
        : Promise<UserDocument | null> {
        const findUser = await this.UserModel
            .findOne({ 'emailConfirmation.confirmationCode': emailConfirmationCode });
        if (findUser) {
            return findUser;
        } else {
            return null;
        }
    }
    async checkRecoveryCode(passwordRecoveryCode: string): Promise<boolean> {
        const checkCode = await this.UserModel
            .findOne({ 'emailConfirmation.passwordRecoveryCode': passwordRecoveryCode })
            .lean();
        return !!checkCode;
    }
    async updateConfirmCode(_id: ObjectId, newCode: string): Promise<UserDocument | null> {
        const updateCodeUser = await this.UserModel
            .updateOne({ _id }, { $set: { 'emailConfirmation.confirmationCode': newCode } });

        if (updateCodeUser.modifiedCount <= 0) return null;
        const user = await this.UserModel
            .findOne({ _id });
        if (user) {
            return user;
        } else {
            return null;
        }
    }
    async updatePassRecoveryCode(email: string, newCode: string): Promise<boolean> {
        const updateCode = await this.UserModel
            .updateOne(
                { 'accountData.email': email },
                { $set: { 'emailConfirmation.passwordRecoveryCode': newCode } }
            );
        return updateCode.modifiedCount > 0;
    }
    async updatePassHash(code: string, newHash: string): Promise<boolean> {
        const updatePassHash = await this.UserModel
            .updateOne(
                { 'emailConfirmation.passwordRecoveryCode': code },
                {
                    $set: { 'accountData.passwordHash': newHash }
                }
            );
        return updatePassHash.modifiedCount > 0;
    }


    async save(user: UserDocument) {
        return await user.save();
    }
    async addExpiredRefreshToken(id: ObjectId, refreshToken: string): Promise<boolean> {
        const user = await this.UserModel
            .updateOne(
                { _id: id },
                {
                    $push: { 'authData.expirationRefreshToken': refreshToken }
                }
            );
        return user.modifiedCount > 0;
    }
    async deleteRecoveryCode(code: string): Promise<boolean> {
        const deleteCode = await this.UserModel
            .updateOne(
                { 'emailConfirmation.passwordRecoveryCode': code },
                {
                    $set: { 'emailConfirmation.passwordRecoveryCode': '' }
                }
            );
        return deleteCode.modifiedCount > 0;
    }
    async deleteUser(id: ObjectId): Promise<boolean> {
        const deleteUser = await this.UserModel
            .deleteOne({ _id: id });
        return !!deleteUser;
    }
    async deleteAllUser(): Promise<boolean> {
        const delUsers = await this.UserModel
            .deleteMany({});
        return delUsers.deletedCount >= 1;
    }
}
