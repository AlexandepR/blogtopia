import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constants";
import { UsersModule } from "./users.module";
import { AuthController } from "./auth.cotroller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/type/users.schema";
import { UsersRepository } from "../users/users.repository";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { AuthGuard } from "./auth.guard";
import { BasicAuthGuard } from "./guards/basic.auth.guard";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    // PassportModule.register({ defaultStrategy: 'basic' }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10m' },
    }),
  MongooseModule.forFeature([
    {
      name: User.name,
      schema: UserSchema,
    },
  ]),
  ],
  providers: [
    AuthService,
    UsersRepository,
    BasicAuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
