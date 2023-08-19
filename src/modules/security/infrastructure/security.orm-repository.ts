import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { UsersDevicesSessionsType } from "../type/security.types";
import { UsersDevicesSessions } from "../../users/domain/entities/usersDevices.entity";
import { Users } from "../../users/domain/entities/user.entity";


@Injectable()
export class SecurityOrmRepository {
  constructor(
    @InjectRepository(UsersDevicesSessions) private readonly usersDevicesSessions: Repository<UsersDevicesSessions>,
    @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
  ) {
  }
  async createSession(
    userId: string,
    ip: string,
    deviceName: string
  ): Promise<UsersDevicesSessionsType | null> {
    const deviceId = randomUUID();
    const issuedDateRefreshToken = new Date().toISOString();
    const user = await this.usersRepository.findOneBy({ ID: userId });
    if (user) {
      const session = new UsersDevicesSessions();
      session.ip = ip;
      session.deviceId = deviceId;
      session.title = deviceName;
      session.lastActiveDate = issuedDateRefreshToken;
      session.user = user;
      return this.usersDevicesSessions.save(session);
    }
    return null;
  }
  async updateDateSession(issuedDate: string, deviceId: string): Promise<boolean> {
    const updateDateSession = await this.usersDevicesSessions
      .update({ deviceId: deviceId },
        { lastActiveDate: issuedDate }
      );
    return updateDateSession.affected > 0;
  }
  async findSessionsByUserId(userId: string): Promise<Omit<UsersDevicesSessionsType, "ID">[] | null> {
    const findSession = await this.usersDevicesSessions
      .find({ where: { user: { ID: userId } } });
    if (findSession) {
      return findSession.map((user, i) => ({
        deviceId: user.deviceId,
        ip: user.ip,
        lastActiveDate: user.lastActiveDate,
        title: user.title
      }));
    }
    return null;
  }
  async findSessionByDeviceId(deviceId: string): Promise<UsersDevicesSessionsType> {
    const findSession = await this.usersDevicesSessions
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.user", "user")
      .where("session.deviceId = :deviceId", { deviceId })
      .getOne();
    if (findSession) {
      return {
        ID: findSession.ID,
        ip: findSession.ip,
        deviceId: findSession.deviceId,
        title: findSession.title,
        lastActiveDate: findSession.lastActiveDate,
        userId: findSession.user.ID
      };
    }
    return null;
  }
  async terminateAllSessions(userId: string): Promise<boolean> {
    const terminateSessions = await this.usersDevicesSessions
      .createQueryBuilder()
      .delete()
      .from(UsersDevicesSessions)
      .where("userId = :userId", { userId })
      .execute();
    return terminateSessions.affected > 0;
  }
  async terminateOtherSessions(userId: string, deviceId: string): Promise<boolean> {
    const terminateSessions = await this.usersDevicesSessions
      .createQueryBuilder()
      .delete()
      .from(UsersDevicesSessions)
      .where("userId = :userId", { userId })
      .andWhere("deviceId != :deviceId", { deviceId })
      .execute();
    return terminateSessions.affected > 0;
  }
  async terminateSessionByDeviceId(deviceId: string, userId: string): Promise<boolean> {
    const delSession = await this.usersDevicesSessions
      .createQueryBuilder()
      .delete()
      .from(UsersDevicesSessions)
      .where("deviceId = :deviceId", { deviceId })
      .andWhere("userId = :userId", { userId })
      .execute();
    return delSession.affected > 0;
  }
}