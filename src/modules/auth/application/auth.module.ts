// import { Module } from "@nestjs/common";
// import { APP_GUARD } from "@nestjs/core";
// import { JwtModule } from "@nestjs/jwt";
// import { AuthService } from "./auth.service";
// import { UsersModule } from "../users/users.module";
// import { AuthController } from "./auth.cotroller";
// import { MongooseModule } from "@nestjs/mongoose";
// import { User, UserSchema } from "../users/type/users.schema";
// import { UsersRepository } from "../users/users.repository";
// import { PassportModule } from "@nestjs/passport";
// import { ConfigModule } from "@nestjs/config";
// import { AuthGuard } from "./guards/auth.guard";
// import { BasicAuthGuard } from "./guards/basic.auth.guard";
// import { CheckLoginOrEmailGuard, EmailConfirmGuard, recoveryCodeGuard } from "../middleware/middleware";
// import { UsersService } from "../users/users.service";
// import { EmailService } from "../managers/email.service";
// import { EmailAdapter } from "../managers/email.adapter";
// import { EmailModule } from "../managers/email.module";
// import { SecurityService } from "../security/security.service";
// import { SecurityRepository } from "../security/security.repository";
// import { JwtService } from "./jwt.service";
// import { Security, SecuritySchema } from "../security/type/security.schema";
// import { settingsEnv } from "../settings/settings";
// import { CqrsModule } from "@nestjs/cqrs";
//
// @Module({
//   imports: [
//     UsersModule,
//     PassportModule,
//     ConfigModule,
//     // CqrsModule,
//     JwtModule.register({
//       global: true,
//       // secret: jwtConstants.secret,
//       secret: settingsEnv.JWT_SECRET,
//       signOptions: { expiresIn: '10m' },
//     }),
//   MongooseModule.forFeature([
//     {
//       name: User.name,
//       schema: UserSchema,
//     },
//     {
//       name: Security.name,      // ????
//       schema: SecuritySchema,   // ????
//     },
//   ]),
//     EmailModule,
//   ],
//   providers: [
//     AuthService,
//     UsersService,
//     UsersRepository,
//     EmailService,
//     EmailAdapter,
//     BasicAuthGuard,
//     EmailConfirmGuard,
//     CheckLoginOrEmailGuard,
//     recoveryCodeGuard,
//     SecurityService,
//     SecurityRepository,
//     JwtService,
//     {
//       provide: APP_GUARD,
//       useClass: AuthGuard,
//     },
//   ],
//   // controllers: [AuthController],
//   // exports: [AuthService, JwtService],
// })
// export class AuthModule {}