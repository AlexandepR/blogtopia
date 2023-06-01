import { commentContentInputClassModel } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../comments.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { idParamsValidator } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";


export class UpdateCommentCommand {
  constructor(
    public dto: commentContentInputClassModel,
    public id: string,
    public user: UserDocument
  ) {
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
  ) {
  }
  async execute(command: UpdateCommentCommand): Promise<void> {
    await validateOrRejectModel(command.dto, commentContentInputClassModel);
    const commentId = idParamsValidator(command.id);
    const comment = await this.commentsRepository.getCommentsById(commentId);
    if (!comment) throw new HttpException("", HttpStatus.NOT_FOUND);
    const commentIsUpdate = await this.commentsRepository.updateCommentId(new Types.ObjectId(command.id), command.dto.content);
    if (command.user._id.toString() !== comment?.commentatorInfo.userId) {
      throw new HttpException("", HttpStatus.FORBIDDEN);
    }
    if (commentIsUpdate) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException("", HttpStatus.NOT_FOUND);
    }
  }
}