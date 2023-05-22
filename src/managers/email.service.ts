import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailAdapter } from "./email.adapter";

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

  async sendEmailConfirmationMessage(user) {
    // const emailConfirmationLink = `https://l1bloggers.vercel.app/confirm-email?code=${user.emailConfirmation.confirmationCode}`;

    const sendEmail = await this.emailAdapter.sendEmail(
      user.accountData.email,
      "Confirmation code",
      `
        <div>
          <h1>Thank for your registration</h1>
          <p>To finish registration please follow the link below:
          <a href="https://l1bloggers.vercel.app/confirm-email?code=${user.emailConfirmation.confirmationCode}">Complete registration</a>
        </p>
        </div>
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