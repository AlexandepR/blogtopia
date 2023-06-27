import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputClassModel, GetUsersOutputModelType } from '../../../type/usersTypes';
import { validateOrRejectModel } from '../../../../../utils/validation.helpers';
import { generateHash } from '../../../../../utils/helpers';
import { UsersSqlRepository } from '../../../infrastructure/users.sql-repository';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateUserByAdminCommand {
  constructor(
    public dto: CreateUserInputClassModel,
    public ip: any,
  ) {
  }
}

@CommandHandler(CreateUserByAdminCommand)
export class CreateUserByAdminUseCase implements ICommandHandler<CreateUserByAdminCommand> {
  constructor(
    protected UsersSqlRepository: UsersSqlRepository,
  ) {
  }
  async execute(command: CreateUserByAdminCommand): Promise<GetUsersOutputModelType | null | any> {
    await validateOrRejectModel(command.dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(command.dto.password);
    const confirmEmail = true;
    const findUserByEmail = await this.UsersSqlRepository.findByLoginOrEmail(command.dto.email);
    const findUserByLogin = await this.UsersSqlRepository.findByLoginOrEmail(command.dto.login);
    if (findUserByLogin || findUserByEmail) throw new HttpException('', HttpStatus.BAD_REQUEST);
    const createUser = await this.UsersSqlRepository.createUser(command.dto, passwordHash, command.ip, confirmEmail);
    return {
      id: createUser.ID,
      login: createUser.login,
      email: createUser.email,
      createdAt: createUser.createdAt,
      banInfo: {
        isBanned: createUser.banInfo.isBanned,
        banDate: createUser.banInfo.banDate,
        banReason: createUser.banInfo.banReason,
      }
    };
  }
}