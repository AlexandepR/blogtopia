import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailAdapter } from "./email.adapter";
import { FindUserType, GetUsersOutputModelType } from '../../../users/type/usersTypes';

@Injectable()
export class EmailService {
  constructor(
    protected emailAdapter: EmailAdapter
  ) {
  }

  sendPasswordRecoveryMessage(user: any) {
    this.emailAdapter.sendEmail(
      user.email,
      "Password recovery",
      `<div>${user.recoveryCode} message</div>`
    );
  }

  async sendEmailConfirmationMessage(user: FindUserType | GetUsersOutputModelType) {
    const sendEmail = await this.emailAdapter.sendEmail(
      user.email,
      "Confirmation code",
      `
          <h1>Thank for your registration</h1>
          <p>To finish registration please follow the link below:
          <a href="https://l1bloggers.vercel.app/confirm-email?code=${user.confirmationCode}">Complete registration</a>
        </p>
      `
    );
    return !!sendEmail
  }

  async sendEmailRecoveryPassCode(email: string, code: string) {
    const recoveryPasswordLink = `https://l1bloggers.vercel.app/password-recovery?recoveryCode=${code}`;

    const sendEmail = await this.emailAdapter.sendEmail(
      email,
      "Recovery password code",
      `
        <div>
          <h1>Code for recovery password</h1>
          <p>To finish password recovery please follow the link below:</p>
          <a href="${recoveryPasswordLink}">Recovery password</a>
        </div>
      `
    );
    if (sendEmail) {
      return sendEmail;
    } else {
      return null;
    }
  }
}