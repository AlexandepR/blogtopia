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
    // protected usersRepository: UsersRepository,
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
    return createUser
    // return {
    //   id: createUser._id.toString(),
    //   login: createUser.accountData.login,
    //   email: createUser.accountData.email,
    //   createdAt: createUser.accountData.createdAt,
    //   banInfo: {
    //     isBanned: createUser.accountData.banInfo.isBanned,
    //     banDate: createUser.accountData.banInfo.banDate,
    //     banReason: createUser.accountData.banInfo.banReason,
    //   }
    // };
  }
}