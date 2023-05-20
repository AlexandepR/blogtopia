import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { settingsEnv } from "./settings/settings";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./helpers/exception.filter";
import * as cookieParser from 'cookie-parser';

export const addSettingsApp = (app: INestApplication) => {
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
            filed: e.property
          });
        });
      });
      throw new BadRequestException(errorsForResponse);
    }
  }));
  app.useGlobalFilters(new HttpExceptionFilter(),
    // new ErrorExceptionFilter()
  );
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors();
  addSettingsApp(app)
  const config = new DocumentBuilder()
    .setTitle("Blogs example")
    .setDescription("The blogs API description")
    .setVersion("1.0")
    .addTag("blogs")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);
  // app.useGlobalPipes(new ValidationPipe({
  //   // stopAtFirstError: true,
  //   // forbidUnknownValues: false,
  //   transform: true,
  //   exceptionFactory: (errors) => {
  //     const errorsForResponse = [];
  //
  //     errors.forEach((e) => {
  //       const constraintsKeys = Object.keys(e.constraints);
  //       constraintsKeys.forEach((ckey) => {
  //         errorsForResponse.push({
  //           message: e.constraints[ckey],
  //           filed: e.property
  //         });
  //       });
  //     });
  //
  //     throw new BadRequestException(errorsForResponse);
  //
  //   }
  // }));
  // app.useGlobalFilters(new HttpExceptionFilter(),
  //   // new ErrorExceptionFilter()
  // );
  await app.listen(settingsEnv.PORT || 5001);  //:27017
  console.log(`Application is running on: ${await app.getUrl()}`);
  const serverUrl = process.env.SERVER_URL;

  // if (process.env.NODE_ENV === "development") {
  //   get(
  //     `${serverUrl}/swagger/swagger-ui-bundle.js`, function
  //     (response) {
  //       response.pipe(createWriteStream("swagger-static/swagger-ui-bundle.js"));
  //       console.log(
  //         `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`
  //       );
  //     });
  //
  //   get(`${serverUrl}/swagger/swagger-ui-init.js`, function(response) {
  //     response.pipe(createWriteStream("swagger-static/swagger-ui-init.js"));
  //     console.log(
  //       `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`
  //     );
  //   });
  //
  //   get(
  //     `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
  //     function(response) {
  //       response.pipe(
  //         createWriteStream("swagger-static/swagger-ui-standalone-preset.js")
  //       );
  //       console.log(
  //         `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`
  //       );
  //     });
  //
  //   get(`${serverUrl}/swagger/swagger-ui.css`, function(response) {
  //     response.pipe(createWriteStream("swagger-static/swagger-ui.css"));
  //     console.log(
  //       `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`
  //     );
  //   });
  // }
}

bootstrap();
