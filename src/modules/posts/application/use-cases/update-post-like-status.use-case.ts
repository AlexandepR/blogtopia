import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../utils/validation.helpers';
import { validateIdByUUID } from '../../../../utils/helpers';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { likeStatusInputClassModel } from '../../type/postsType';
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { FindUserType } from '../../../users/type/usersTypes';


export class UpdatePostLikeStatusCommand {
    constructor(
        public dto: likeStatusInputClassModel,
        public postId: string,
        public user: FindUserType,
    ) {
    }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<UpdatePostLikeStatusCommand> {
    constructor(
        protected usersSqlRepository: UsersSqlRepository,
        protected postsSqlRepository: PostsSqlRepository,
    ) {
    }
    async execute({ dto, postId, user: reqUser }: UpdatePostLikeStatusCommand): Promise<boolean> {
        await validateOrRejectModel(dto, likeStatusInputClassModel);
        if (!validateIdByUUID(postId)) throw new NotFoundException();
        const post = await this.postsSqlRepository.findPostById(postId);
        const user = await this.usersSqlRepository.findUserById(reqUser.ID);
        if (!user || !post || user.banInfo.isBanned) throw new HttpException('', HttpStatus.NOT_FOUND);
        if (dto.likeStatus === 'None') return await this.postsSqlRepository.deleteLikesStatus(user.ID, postId);
        const updateLikesStatus = await this.postsSqlRepository.createPostLikesInfo(user.ID, user.login, postId, dto);
        if (updateLikesStatus) throw new HttpException('', HttpStatus.NO_CONTENT);
        throw new HttpException('', HttpStatus.NOT_FOUND);
    }
}