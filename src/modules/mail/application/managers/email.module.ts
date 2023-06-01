// import { Module } from '@nestjs/common';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { EmailService } from "./email.service";
// import { EmailAdapter } from "./email.adapter";
// import { settingsEnv } from "../settings/settings";
//
// @Module({
//   imports: [
//     MailerModule.forRoot({
//       transport: {
//         service: 'gmail', // if write 'gmail', settings below not need
//         auth: {
//           user: settingsEnv.EMAIL_LOG,
//           pass: settingsEnv.EMAIL_PASS,
//         },
//       },
//       defaults: {
//         from: `"Alex" <${settingsEnv.EMAIL_LOG}>`,
//       },
//     }),
//   ],
//   providers: [
//     EmailService,
//     EmailAdapter,
//   ],
//   // controllers: [MailingController],
//   exports: [EmailService, EmailAdapter],
// })
// export class EmailModule {}