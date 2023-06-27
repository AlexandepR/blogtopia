import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersSqlRepository } from '../../../infrastructure/users.sql-repository';
import { Repository } from 'typeorm';

export class DeleteUserByAdminCommand {
  constructor(public id: string,) {}
}

@CommandHandler(DeleteUserByAdminCommand)
export class DeleteUserByAdminUseCase implements ICommandHandler<DeleteUserByAdminCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersSqlRepository: UsersSqlRepository
    // protected usersSqlRepository: Repository<User>
  ) {}
  async execute(command: DeleteUserByAdminCommand) {
    const userId = command.id
    const findUser = await this.usersSqlRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    const delUser = await this.usersSqlRepository.deleteUser(userId);
    if (!delUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}