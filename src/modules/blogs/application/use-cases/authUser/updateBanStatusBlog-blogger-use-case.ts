import { BlogsRepository } from "../../blogs.repository";
import { BanInfoInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class UpdateBanStatusCommand {
  constructor(
      public userId: string,
      public dto: BanInfoInputClassModel,
  ) {
  }
}

@CommandHandler(UpdateBanStatusCommand)
export class UpdateBanStatusUseCase implements ICommandHandler<UpdateBanStatusCommand>{
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: UpdateBanStatusCommand): Promise<any> {
    await validateOrRejectModel(command.dto, BanInfoInputClassModel)

  }
}