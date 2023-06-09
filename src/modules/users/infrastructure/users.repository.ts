import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User, UserDocument, UserModelType } from '../domain/entities/users.schema';
import { CreateUserInputModelType } from '../type/usersTypes';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name)
        private UserModel: UserModelType,
        @InjectDataSource()
        protected dataSource: DataSource) {
    }
    async getUsers(
        skip: number,
        pageSize: number,
        filter: any,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        banFilterStatus?: any,
    ): Promise<UserDocument[]> {
        const sortedUsers = `accountData.${sortBy}`;
        const users = await this.UserModel
            .find({ ...banFilterStatus, ...filter })
            // , {
            // .find({ or: [banFilterStatus, filter] }, {
            // _id: 0,
            // id: "$_id",
            // "login": 1,
            // "email": 1,
            // "createdAt": 1
            // 'password': 0,
            // }
            // )
            .sort([[sortedUsers, sortDirection]])
            .skip(skip)
            .limit(pageSize);
        return users;
    }
    async getTotalCountUsers(filter: any, banStatus?: any): Promise<number> {
        const count = await this.UserModel
            .countDocuments({ ...banStatus, ...filter });
        return count;
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
        confirmEmail: boolean
    ): Promise<UserDocument> {
        const user = User.create(userDto, this.UserModel, passwordHash, ip, confirmEmail);
        return user.save();
    }
    async findUserById(id: Types.ObjectId): Promise<UserDocument> {
        return this.UserModel
            .findOne({ _id: id });
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        const findUser = await this.UserModel
            .findOne(
                {
                    $or:
                        [
                            { 'accountData.email': loginOrEmail },
                            { 'accountData.login': loginOrEmail }
                        ]
                }
            );
        if (findUser) {
            return findUser;
        } else {
            return null;
        }
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
