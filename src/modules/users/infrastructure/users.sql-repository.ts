import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { User, UserDocument, UserModelType } from '../domain/entities/users.schema';
import {
    CreateUserInputModelType,
    FindUserType,
    GetUsersOutputModelType,
    InfoBanStatusType,
    UserOutputModelType
} from '../type/usersTypes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersSqlRepository {
    constructor(
        @InjectModel(User.name) private UserModel: UserModelType,
        // @InjectRepository(User) private readonly use
        @InjectDataSource() protected dataSource: DataSource) {
    }
    async getUsers(
        skip: number,
        pageSize: number,
        filter: string,
        sortBy: string,
        sortDirection: 'asc' | 'desc',
        banFilterStatus?: boolean,
    )
        : Promise<GetUsersOutputModelType[]> {
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
            ORDER BY ${sortBy === 'created_at' ? 'u."created_at"' : `"${sortBy}" COLLATE "C"`} ${sortDirection}
            LIMIT ${pageSize}
            OFFSET ${skip}
        `;
        return await this.dataSource.query(selectQuery);
    }
    async getTotalCountUsers(filter: any, banStatus?: boolean): Promise<number> {
        const countQuery = `
        SELECT u.*, b."isBanned"
        FROM public."Users" u
        LEFT JOIN public."BanUserInfo" b
        ON b."userId" = u."ID"
        ${filter}
        `;
        const count = await this.dataSource.query(countQuery);
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
    ): Promise<GetUsersOutputModelType> {
        const date = new Date().toISOString();
        const confirmCode = uuidv4();
        const expConfirmCodeDate = add(new Date(), { hours: 1, minutes: 3 });
        const insertQuery = `
            WITH inserted_user AS (
            INSERT INTO public."Users" (
            login, email, created_at,
            "passwordHash", "isConfirmed", "confirmationCode", "expConfirmCodeDate")
            VALUES (
            '${userDto.login}', '${userDto.email}', '${date}',
            '${passwordHash}', '${isConfirmEmail}','${confirmCode}', '${expConfirmCodeDate}'
            )
            RETURNING "ID", login, email, created_at, "confirmationCode"
        ),
            inserted_ban_user AS (
            INSERT INTO public."BanUserInfo" ("userId")
            SELECT "ID"
            FROM inserted_user
            RETURNING * 
        )
              SELECT
            inserted_user."ID",
            inserted_user.login,
            inserted_user.email,
            inserted_user.created_at as "createdAt",
            inserted_user."confirmationCode",
            json_build_object(
                'isBanned', inserted_ban_user."isBanned",
                'banDate', inserted_ban_user."banDate",
                'banReason', inserted_ban_user."banReason"
            ) as "banInfo"
            FROM inserted_user
            LEFT JOIN inserted_ban_user ON inserted_user."ID" = inserted_ban_user."userId";
  `;
        const user = await this.dataSource.query(insertQuery);
        return user[0];
    //     inserted_user_device_session AS (
    //         INSERT INTO public."UsersDevicesSessions" ("userId")
    //     SELECT "ID"
    //     FROM inserted_user
    //     RETURNING *
    // )
    }
    async findUserById(id: string): Promise<FindUserType> {
        const selectQuery = `
        SELECT u.*,
           json_build_object(
            'isBanned', b."isBanned",
            'banDate', b."banDate",
            'banReason', b."banReason"
        ) as "banInfo",
           json_build_object(
            'ip', d."ip",
            'deviceId', d."deviceId",
            'title', d."title",
            'lastActiveDate', d."lastActiveDate"
        ) as "devicesSession"
        FROM public."Users" u
        LEFT JOIN public."BanUserInfo" b ON b."userId" = u."ID"
        LEFT JOIN public."UsersDevicesSessions" d ON d."userId" = u."ID"
        WHERE u."ID" = '${id}'
        `;
        const result =  await this.dataSource.query(selectQuery);
        return result[0]
    }
    async findByLoginOrEmail(loginOrEmail: string): Promise<FindUserType | null> {
        const findUserQuery = `
        SELECT u.*,
           json_build_object(
            'isBanned', b."isBanned",
            'banDate', b."banDate",
            'banReason', b."banReason"
        ) as "banInfo",
           json_build_object(
            'ip', d."ip",
            'deviceId', d."deviceId",
            'title', d."title",
            'lastActiveDate', d."lastActiveDate"
        ) as "devicesSession"
        FROM public."Users" u 
        LEFT JOIN public."BanUserInfo" b ON b."userId" = u."ID"
        LEFT JOIN public."UsersDevicesSessions" d ON d."userId" = u."ID"
        WHERE login = '${loginOrEmail}' OR email = '${loginOrEmail}'
        `;
        const findUser = await this.dataSource.query(findUserQuery);
        if (findUser.length > 0) return findUser[0];
        return null;
    }
    async findByConfirmationCode(emailConfirmationCode: string)
        : Promise<UserOutputModelType | null> {
        const userByConfirmCodeQuery = `
            SELECT *
            FROM public."Users" u
            WHERE u."confirmationCode" = '${emailConfirmationCode}'
        `;
        const findUser = await this.dataSource.query(userByConfirmCodeQuery);
        if (findUser.length > 0) return findUser[0];
        return null;
    }
    async checkRecoveryCode(passwordRecoveryCode: string): Promise<boolean> {
        const findCodeQuery = `
        SELECT *
        FROM public."Users" u
        WHERE u."passRecoveryCode" = '${passwordRecoveryCode}'
        `
        const findUser = await this.dataSource.query(findCodeQuery)
        return !!findUser
    }
    async updateBanStatus(banInfo: InfoBanStatusType, userId: string): Promise<boolean> {
        const date = new Date().toISOString();
        const updateQuery = `
            UPDATE public."BanUserInfo" b
            SET "isBanned"='${banInfo.isBanned}',
            "banDate" = ${banInfo.isBanned ? `'${date}'` : null},
            "banReason" = ${banInfo.isBanned ? `'${banInfo.banReason}'` : null}
            WHERE b."userId" = '${userId}'
         `;
        const result = await this.dataSource.query(updateQuery);
        if (result > 0) {
            return result;
        } else {
            return false;
        }
    }
    async updateConfirmCode(id: string, newCode: string): Promise<boolean> {
        const updateConfirmQuery = `
        UPDATE public."Users" u
        SET "confirmationCode"='${newCode}'
        WHERE u."ID" = '${id}'
        `;
        const result = await this.dataSource.query(updateConfirmQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async updateConfirmStatus(ID: string, isConfirmed: boolean): Promise<boolean> {
        const updateConfirmQuery = `
        UPDATE public."Users" u
        SET "isConfirmed"='${isConfirmed}'
        WHERE u."ID" = '${ID}'
        `;
        const result = await this.dataSource.query(updateConfirmQuery);
        if (result !== null && result !== undefined) {
            return result;
        } else {
            return false;
        }
    }
    async updatePassRecoveryCode(email: string, newCode: string): Promise<boolean> {
        const updateQuery = `
        UPDATE public."Users" u
        SET "passRecoveryCode"='${newCode}'
        WHERE u."email" = '${email}'
        `
        const result = await this.dataSource.query(updateQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async updatePassHash(code: string, newHash: string): Promise<boolean> {
        const updatePassHashQuery = `
        UPDATE public."Users" u
        SET "passwordHash" = $1, "passRecoveryCode" = $2
        WHERE u."passRecoveryCode" = $3
        `;
        const result = await this.dataSource.query(updatePassHashQuery, [newHash, code, code]);
        return result !== null && result !== undefined && result[1] > 0;
    }

    async save(user: UserDocument) {
        return await user.save();
    }
    async addExpiredRefreshToken(id: string, refreshToken: string): Promise<boolean> {
        const addExpTokenQuery = `
        UPDATE public."Users" u
        SET "expRefreshToken" = array_append(u."expRefreshToken", '${refreshToken}')
        WHERE u."ID" = '${id}'
        `
        const result = await this.dataSource.query(addExpTokenQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async deleteRecoveryCode(code: string): Promise<boolean> {
        const delRecoveryCodeQuery = `
        UPDATE public."Users" u
        SET "passRecoveryCode"=''
        WHERE u."passRecoveryCode" = '${code}'
        `
        const result = await this.dataSource.query(delRecoveryCodeQuery);
        if (result !== null && result !== undefined && result[1] > 0) {
            return true;
        } else {
            return false;
        }
    }
    async deleteUser(id: string): Promise<boolean> {
        const delQuery = `
        DELETE FROM public."Users" u
        WHERE u."ID" = '${id}'
        `;
        return await this.dataSource.query(delQuery);
    }
    async deleteAllUser(): Promise<boolean> {
        const delUsers = await this.UserModel
            .deleteMany({});
        return delUsers.deletedCount >= 1;
    }
}
