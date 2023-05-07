// import dotenv from 'dotenv';
// dotenv.config();

export const settingsEnv = {
  // const mongoUri : process.env.mongoURI || "mongodb://0.0.0.0:27017";
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL as string,
  mongoUri: process.env.mongoUri as string,
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
}