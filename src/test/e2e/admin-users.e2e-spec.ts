import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module";
import { addSettingsApp } from "../../addSettingsApp";
import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { settingsEnv } from "../../settings/settings";


describe("Test admin for users", () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleFixture.createNestApplication();
    addSettingsApp(app);
    await app.init();
    httpServer = app.getHttpServer();
    await request(httpServer)
      .delete("/testing/all-data");
  });

  afterAll(async () => {
    await app.close();
  });

  const basicAuth = Buffer.from(`${settingsEnv.BASIC_LOGIN}:${settingsEnv.BASIC_PASS}`).toString("base64");
  const createUser = (num: number) => {
    return {
      login: "user" + num,
      email: "user" + num + "@gmail.com",
      password: "123456"
    };
  };
  let userId1;
  let userId2;

  it("get array without users", async () => {
    const response = await request(httpServer)
      .get("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    expect(response.body.items).toEqual([]);
  });
  it("should create user", async () => {
    const response = await request(httpServer)
      .post("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .send(createUser(1))
      .expect(201);
    expect(response.body.login).toEqual("user1");
    userId1 = response.body.id;
    console.log(userId1);
  });
  it("should update ban status user", async () => {
    await request(httpServer)
      .put(`/sa/users/${userId1}/ban`)
      .set("Authorization", `Basic ${basicAuth}`)
      .send({
        "isBanned": true,
        "banReason": "veryyyyyyyyy strange user"
      })
      .expect(204);
  });
  it("get banned user", async () => {
    const response = await request(httpServer)
      .get("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    expect(response.body.items[0].login).toEqual("user1");
    expect(response.body.items[0].banInfo.isBanned).toEqual(true);
  });
  it("should delete user", async () => {
    await request(httpServer)
      .delete(`/sa/users/${userId1}`)
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(204);
  });
  it("get array without users", async () => {
    const response = await request(httpServer)
      .get("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    expect(response.body.items).toEqual([]);
  });
});