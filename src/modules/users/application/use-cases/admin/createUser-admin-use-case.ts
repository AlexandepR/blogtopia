import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel, GetUsersOutputModelType, UserType } from "../../../type/usersTypes";
import { UsersRepository } from "../../users.repository";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { generateHash } from "../../../../../utils/helpers";

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
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: CreateUserByAdminCommand): Promise<GetUsersOutputModelType | null> {
    await validateOrRejectModel(command.dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(command.dto.password);
    const confirmEmail = true;
    const createUser = await this.usersRepository.createUser(command.dto, passwordHash, command.ip, confirmEmail);
    return {
      id: createUser._id.toString(),
      login: createUser.accountData.login,
      email: createUser.accountData.email,
      createdAt: createUser.accountData.createdAt,
      banInfo: {
        isBanned: createUser.accountData.banInfo.isBanned,
        banDate: createUser.accountData.banInfo.banDate,
        banReason: createUser.accountData.banInfo.banReason,
      }
    };
  }
}