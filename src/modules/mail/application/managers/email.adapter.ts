import { Injectable } from '@nestjs/common';
// import nodemailer from 'nodemailer';
import * as nodemailer from 'nodemailer';
import { settingsEnv } from "../../../../settings/settings";

@Injectable()
export class EmailAdapter {

  constructor() {
  }
  async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settingsEnv.EMAIL_LOG,
        pass: settingsEnv.EMAIL_PASS,
      },
    });

    const info = await transport.sendMail({
      from: `Alex 👻 ${settingsEnv.EMAIL_LOG}>`,
      to: email,
      subject: subject,
      html: message,
    });

    return info.rejected.length === 0;
  }
}