import * as dotenv from 'dotenv';
dotenv.config();

export const settingsEnv = {
  PORT: process.env.PORT,
  PORT_PG: process.env.PORT_PG,
  MONGO_URL: process.env.MONGO_URL,
  DB_NAME: process.env.DB_NAME,
  EMAIL_LOG: process.env.EMAIL_LOG,
  EMAIL_PASS: process.env.EMAIL_PASS,
  LOGIN_PG: process.env.LOGIN_PG,
  PASS_PG: process.env.PASS_PG,
  BASIC_LOGIN: process.env.BASIC_LOGIN,
  BASIC_PASS: process.env.BASIC_PASS,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  JWT_TOKEN_LIFE: process.env.JWT_TOKEN_LIFE,
  JWT_REFRESH_TOKEN_LIFE: process.env.JWT_REFRESH_TOKEN_LIFE,
  NODE_ENV: process.env.NODE_ENV,
}


