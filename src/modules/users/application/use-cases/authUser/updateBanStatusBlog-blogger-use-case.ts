import { BlogsRepository } from "../../../../blogs/application/blogs.repository";
import { BanInfoInputClassModel } from "../../../../blogs/type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../type/users.schema";
import { Types } from "mongoose";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../users.repository";
import { validateObjectId } from "../../../../../utils/helpers";


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
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: UpdateBanStatusCommand): Promise<any> {
    await validateOrRejectModel(command.dto, BanInfoInputClassModel)
    const getUserId = validateObjectId(command.userId)
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.dto.blogId))
    if(!blog) throw new NotFoundException()
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    // const getUser = this.usersRepository.findUserById(getUserId)
    // if(blog.banUsersInfo.find((ban) => ban.login === command.user.accountData.login)) { throw new HttpException('',HttpStatus.NO_CONTENT)}
    const getUser = await  this.usersRepository.findUserById(getUserId)
    if(!getUser) {throw new NotFoundException()}
    // if(blog.banUsersInfo.find((ban) => ban.login === )) { throw new HttpException('',HttpStatus.NO_CONTENT)}
    const findUser = blog.banUsersInfo
      .find((ban) => ban.login === getUser.accountData.login
        && ban.banInfo.isBanned === command.dto.isBanned)
    if(findUser)throw new HttpException('',HttpStatus.NO_CONTENT)
    if(command.dto.isBanned ) {
    blog.banUser(command.dto, getUser.accountData.login, new Types.ObjectId(command.userId))
    return await this.blogsRepository.save(blog)
    } else {
      await this.blogsRepository.unBanUser(new Types.ObjectId(command.dto.blogId), command.user.accountData.login);
      return await this.blogsRepository.save(blog)
    }
  }
}