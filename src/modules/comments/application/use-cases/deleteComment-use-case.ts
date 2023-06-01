import { commentContentInputClassModel } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../comments.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { idParamsValidator } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import { CommentsService } from "../comments.service";


export class DeleteCommentCommand {
  constructor(
    public user: UserDocument,
    public id: string,
  ) {
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentsService: CommentsService,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const commentId = idParamsValidator(command.id);
    const userId = command.user._id
    const getComment = await this.commentsService.getComment(commentId, userId);
    if (!getComment) {throw new HttpException('', HttpStatus.NOT_FOUND)}
    if (userId.toString() !== getComment?.commentatorInfo.userId) {
      throw new HttpException('', HttpStatus.FORBIDDEN)
    }
    const isDeleted = await this.commentsRepository.deleteComment(commentId);
    if (isDeleted) {throw new HttpException('', HttpStatus.NO_CONTENT)} else {
      throw new HttpException('', HttpStatus.NOT_FOUND)}}
}