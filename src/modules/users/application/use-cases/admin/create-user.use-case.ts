import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel, GetUsersOutputModelType } from "../../../type/usersTypes";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { generateHash } from "../../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { UsersOrmRepository } from "../../../infrastructure/users.orm-repository";

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
    protected usersOrmRepository: UsersOrmRepository) {
  }
  async execute({dto, ip}: CreateUserByAdminCommand): Promise<GetUsersOutputModelType | null | any> {
    await validateOrRejectModel(dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(dto.password);
    const findUserByEmail = await this.usersOrmRepository.findByLoginOrEmail(dto.email);
    const findUserByLogin = await this.usersOrmRepository.findByLoginOrEmail(dto.login);
    if (findUserByLogin || findUserByEmail) throw new HttpException('', HttpStatus.FORBIDDEN);
    return await this.usersOrmRepository.createUserByAdmin(dto.email, dto.login, passwordHash, ip)
  }
}