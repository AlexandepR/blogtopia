import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module";
import request from "supertest";
import { settingsEnv } from "../../settings/settings";
// import { CreateUserInputClassModel, UsersService } from "../../users/users.service";

import { addSettingsApp } from "../../main";
import { CreateUserInputClassModel } from "../../modules/users/type/usersTypes";

const user1: CreateUserInputClassModel = {
  login: "user1",
  email: "user1@gmail.com",
  password: "1234567"
};
const user2 = {
  login: "user2",
  email: "user2@gmail.com",
  password: "123456"
};

let user1Id = "";
let user2Id = "";

describe("e2e test for Users", () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleFixture.createNestApplication();
    addSettingsApp(app)
    await app.init();
    httpServer = app.getHttpServer();
    await request(httpServer)
      .delete("/testing/all-data");
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return array empty", async () => {
    await request(httpServer)
      .get("/users")
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .expect(200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      });
  });
  // test('GET "/" returns greeting', async () => {
  //     const res = await requestWithSupertest.get('/')
  //     expect(res.status).toEqual(200)
  //     expect(res.type).toEqual(expect.stringContaining('json'))
  //     expect(res.body).toEqual({ greeting: "Hello there!" })
  // })

  it("should create user1", async () => {
    const res = await request(httpServer)
      .post("/users")
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .send(user1)
      .expect(201);
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.email).toEqual("user1@gmail.com");
    expect(res.body.login).toEqual("user1");
    expect(res.body.createdAt).toEqual(expect.any(String));
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect.assertions(5);
    user1Id = res.body.id;
  });
  it("should create user2", async () => {
    const res = await request(httpServer)
      .post("/users")
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .send(user2)
      .expect(201);
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.email).toEqual("user2@gmail.com");
    expect(res.body.login).toEqual("user2");
    expect(res.body.createdAt).toEqual(expect.any(String));
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect.assertions(5);
    user2Id = res.body.id;
  });
  it("should delete user1 by id", async () => {
    await request(httpServer)
      .delete("/users/" + user1Id)
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .expect(204);
    const res = await request(httpServer)
      .get("/users")
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .expect(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items.length).toBeDefined();
    expect.assertions(2);
  });
  it("should return array without user1", async () => {
    const res = await request(httpServer)
      .get("/users")
      .auth(`${settingsEnv.BASIC_LOGIN}`, `${settingsEnv.BASIC_PASS}`, { type: "basic" })
      .expect(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].id).toEqual(user2Id);
    expect(res.body.items[1]).toBeUndefined();
  });
});