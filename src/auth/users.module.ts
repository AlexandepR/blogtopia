import { Module } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { UsersRepository } from "../users/users.repository";
import { User, UserSchema } from "../users/type/users.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "../users/users.controller";


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ])
  ],
  providers: [
    // CheckLoginOrEmailExistsMiddleware,
    UsersService,
    UsersRepository,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
