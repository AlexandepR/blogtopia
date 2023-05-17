import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from "./email.service";
import { EmailAdapter } from "./email.adapter";
import { UsersService } from "../users/users.service";
import { UsersRepository } from "../users/users.repository";
import { User, UserSchema } from "../users/type/users.schema";
import { UsersModule } from "../auth/users.module";
import { AuthService } from "../auth/auth.service";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.mailtrap.io',
        port: 587,
        secure: false,
        auth: {
          user: 'your-username',
          pass: 'your-password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),
    UsersModule,
  ],
  providers: [
    EmailService,
    EmailAdapter,
  ],
  exports: [EmailService],
})
export class EmailModule {}