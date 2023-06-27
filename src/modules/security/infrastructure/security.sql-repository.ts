import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Security, SecurityDocument, SecurityModelType } from '../type/security.schema';
import { Types } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { UsersDevicesSessionsType } from '../type/security.types';
import { logger } from '@typegoose/typegoose/lib/logSettings';


@Injectable()
export class SecuritySqlRepository {
    constructor(
        @InjectModel(Security.name) private SecurityModel: SecurityModelType,
        @InjectDataSource() protected dataSource: DataSource
    ) {
    }
    async createSession(
        userId: string,
        ip: string,
        deviceName: string,
    ): Promise<UsersDevicesSessionsType> {
        const deviceId = randomUUID();
        const issuedDateRefreshToken = new Date().toISOString();
        const setSessionQuery = `
        INSERT INTO public."UsersDevicesSessions"(
          ip, "deviceId", title, "lastActiveDate","userId")
          VALUES (
          '${ip}', '${deviceId}', '${deviceName}','${issuedDateRefreshToken}','${userId}')  
           RETURNING *
    `;
        const createSession = await this.dataSource.query(setSessionQuery);
        return createSession[0];
    }
    async updateDateSession(issuedDate: string, userId: string): Promise<boolean> {
        const updateQuery = `
        UPDATE public."UsersDevicesSessions" u
        SET "lastActiveDate" = '${issuedDate}'
        WHERE u."ID" = '${userId}'
        `;
        const result = await this.dataSource.query(updateQuery);
        if (result && result[1] > 0) {
            return true;
        } else {
            return false;
        }
    }
    async findSessionsByUserId(userId: string): Promise<UsersDevicesSessionsType[]> {
        const findSessionsQuery = `
        SELECT *
        FROM public."UsersDevicesSessions" ud
        WHERE ud."userId" = '${userId}'
        `
        const sessions = await this.dataSource.query(findSessionsQuery);
        return sessions;
    }
    async findSessionByDeviceId(deviceId: string): Promise<UsersDevicesSessionsType> {
        const findSessionQuery = `
        SELECT *
        FROM public."UsersDevicesSessions" ud
        WHERE ud."deviceId" = '${deviceId}'
        `
        const sessions = await this.dataSource.query(findSessionQuery);
        return sessions[0];
    }
    async terminateAllSessions(userId: string): Promise<boolean> {
        const delQuery = `
        UPDATE public."UsersDevicesSessions" ud
        SET 
        "deviceId"=null,
        "title"=null,
        "lastActiveDate"=null,
        "expirationTokenDate"=null
        WHERE ud."userId" = '${userId}'
        `;
        return await this.dataSource.query(delQuery);
    }
    async terminateOtherSessions(userId: string, deviceId: string): Promise<boolean> {
        const terminateSessionsQuery = `
         DELETE FROM public."UsersDevicesSessions" 
         WHERE "userId" = '${userId}' AND "deviceId" != '${deviceId}';
         `;
        const result = await this.dataSource.query(terminateSessionsQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
    async terminateSessionByDeviceId(deviceId: string, userId: string): Promise<boolean> {
        const delQuery = `
         DELETE FROM public."UsersDevicesSessions" 
         WHERE "userId" = '${userId}' AND "deviceId" = '${deviceId}';
       `;
        const result = await this.dataSource.query(delQuery);
        const rowCount = result ? result[1] : 0;
        return rowCount > 0;
    }
}