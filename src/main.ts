import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { settingsEnv } from "./settings/settings";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(`${settingsEnv.PORT}`);
}

bootstrap();
