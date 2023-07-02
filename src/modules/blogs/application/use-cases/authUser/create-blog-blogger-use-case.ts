import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { BlogInputClassModel, BlogType } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { FindUserType } from '../../../../users/type/usersTypes';

export class CreateBlogCommand {
  constructor(
    public user: FindUserType,
    public dto: BlogInputClassModel
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogByBloggerUseCase implements ICommandHandler<CreateBlogCommand>{
  constructor(protected blogsSqlRepository: BlogsSqlRepository) {
  }
  async execute(command: CreateBlogCommand): Promise<BlogType> {
    await validateOrRejectModel(command.dto, BlogInputClassModel);
    if(!command.user) {throw new BadRequestException()}
    const createBlog = await this.blogsSqlRepository.createBlog(command.dto,command.user);
    if (!createBlog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return createBlog[0]
  }
}