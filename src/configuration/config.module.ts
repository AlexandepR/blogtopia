import { Module } from "@nestjs/common";
import { envFilePath } from "./detect-env-file";
import { ConfigModule } from "@nestjs/config";
import ReturnType from 'typescript'



export const getConfiguration = () => {
  return {
  //   ENV: process.env.NODE_ENV,
  //   trash: {
  //     BLABLA: process.env.PORT,
  //   },
  //   db: {
  //     mongo: {
  //       MONGO_URL: process.env.MONGO_URL
  //     }
  //   }
  // };
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,
    EMAIL_LOG: process.env.EMAIL_LOG,
    EMAIL_PASS: process.env.EMAIL_PASS,
    BASIC_LOGIN: process.env.BASIC_LOGIN,
    BASIC_PASS: process.env.BASIC_PASS,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    JWT_TOKEN_LIFE: process.env.JWT_TOKEN_LIFE,
    JWT_REFRESH_TOKEN_LIFE: process.env.JWT_REFRESH_TOKEN_LIFE,
    NODE_ENV: process.env.NODE_ENV,
}};
export type ConfigType = ReturnType<typeof getConfiguration>

// @Module
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath,
  load: [getConfiguration]
});