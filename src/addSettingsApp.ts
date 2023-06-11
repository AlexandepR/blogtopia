import { AppModule } from "./app.module";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exception.filter";
import cookieParser from "cookie-parser";
import { useContainer } from "class-validator";


export const addSettingsApp = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    stopAtFirstError: true,
    // forbidUnknownValues: false,
    transform: true,
    exceptionFactory: (errors) => {
      const errorsForResponse = [];
      // errors.forEach((e) => {
      //   const constraintsKeys = Object.keys(e.constraints);
      //   constraintsKeys.forEach((ckey) => {
      //     const messages = Array.isArray(e.constraints[ckey]) ? e.constraints[ckey] : [e.constraints[ckey]];
      //     if (Array.isArray(messages)) {
      //       messages.forEach((message) => {
      //         errorsForResponse.push({
      //           message,
      //           field: e.property
      //         });
      //       });
      //     } else {
      //       errorsForResponse.push({
      //         message: messages,
      //         field: e.property
      //       });
      //     }
      //   })
      // })

      errors.forEach((e) => {
        const constraintsKeys = Object.keys(e.constraints);
        constraintsKeys.forEach((ckey) => {
          errorsForResponse.push({
            message: e.constraints[ckey],
            field: e.property
          });
        });
      });
      throw new BadRequestException(errorsForResponse);
    }
  }));
  app.useGlobalFilters(new HttpExceptionFilter()
    // new ErrorExceptionFilter()
  );
};
