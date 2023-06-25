import { BlogsRepository } from "../../../../blogs/infrastructure/blogs.repository";
import { BanInfoInputClassModel } from "../../../../blogs/type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../domain/entities/users.schema";
import { Types } from "mongoose";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../../infrastructure/users.repository";
import { validateObjectId } from "../../../../../utils/helpers";
import { BlogsQueryRepository } from "../../../../blogs/infrastructure/blogs.query-repository";


export class UpdateBanStatusCommand {
  constructor(
      public userId: string,
      public dto: BanInfoInputClassModel,
      public user: UserDocument,
  ) {
  }
}

@CommandHandler(UpdateBanStatusCommand)
export class UpdateBanStatusUseCase implements ICommandHandler<UpdateBanStatusCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: UpdateBanStatusCommand): Promise<any> {
    await validateOrRejectModel(command.dto, BanInfoInputClassModel)
    const getUserId = validateObjectId(command.userId)
    const blog = await this.blogsQueryRepository.findBlogById(new Types.ObjectId(command.dto.blogId))
    if(!blog) throw new NotFoundException()
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    const getUser = await  this.usersRepository.findUserById(getUserId)
    if(!getUser) {throw new NotFoundException()}
    const findUser = blog.banUsersInfo
      .find((ban) => ban.login === getUser.accountData.login
        // && ban.banInfo.isBanned === command.dto.isBanned
      )
    // if(findUser) {
    //   await this.blogsRepository.banUser(new Types.ObjectId(command.dto.blogId), getUser.accountData.login)
    // }
    // if(command.dto.isBanned) {
    if(!findUser) {
    blog.banUser(command.dto, getUser.accountData.login, new Types.ObjectId(command.userId))
    return await this.blogsRepository.save(blog)
    } else {
      return await this.blogsRepository.unBanUser(new Types.ObjectId(command.dto.blogId), getUser.accountData.login, command.dto.isBanned);
      // return await this.blogsRepository.save(blog)
    }
  }
}