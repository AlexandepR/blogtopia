import { Module } from "@nestjs/common";
import { envFilePath } from "./detect-env-file";
import { ConfigModule, ConfigService } from "@nestjs/config";
import ReturnType from 'typescript'
import * as Joi from "joi";



export const getConfiguration = () => {
  return {
  //   ENV: process.env.NODE_ENV || 'development',
  //   trash: {
  //     BLABLA: process.env.PORT,
  //   },
  //   db: {
  //     mongo: {
  //       MONGO_URL: process.env.MONGO_URL
  //     }
  //   }
  // };
    PORT_TEST: {
      test: 'test'
    },
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
export type ConfigurationConfigType = ReturnType<typeof getConfiguration>
  // export type ConfigType = ConfigTypeConfigType & {
  //   PORT: string,
  // }
// @Module
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: envFilePath, // can use ['env.local','.env'] priority for env.local, after that .env
  load: [getConfiguration],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test', 'provision')
      .default('development'),
    PORT: Joi.number().default(5005),
  }),
});

// private configService: ConfigService<ConfigType>
// this.configService.get('PORT', {infer: true}).PORT