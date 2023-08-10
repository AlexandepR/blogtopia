import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module";
import { addSettingsApp } from "../../addSettingsApp";
import request from "supertest";
import { INestApplication } from "@nestjs/common";



export const getAppAndCleanDB = async () => {
    let app: INestApplication;
    let httpServer;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleFixture.createNestApplication();
    addSettingsApp(app);
    await app.init();
    httpServer = app.getHttpServer();
    await request(httpServer)
      .delete("/testing/all-data");
    return httpServer
}