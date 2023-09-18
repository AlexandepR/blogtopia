import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { settingsEnv } from "../../settings/settings";
import { getAppAndCleanDB } from "./test-utils";


describe("Test admin for users", () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    httpServer = await getAppAndCleanDB();
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
  it("should create user1", async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await request(httpServer)
      .post("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .send(createUser(1))
      .expect(201);
    expect(response.body.login).toEqual("user1");
    expect(response.body).toEqual({
        "id": expect.any(String),
        "login": "user1",
        "email": "user1@gmail.com",
        "createdAt": expect.any(String),
      }
    );
    userId1 = response.body.id;
  });
  it("should create user2", async () => {
    const response = await request(httpServer)
      .post("/sa/users")
      .set("Authorization", `Basic ${basicAuth}`)
      .send(createUser(2))
      .expect(201);
    expect(response.body.login).toEqual("user2");
    expect(response.body).toEqual({
        "id": expect.any(String),
        "login": "user2",
        "email": "user2@gmail.com",
        "createdAt": expect.any(String),
      }
    );
    userId2 = response.body.id;
  });
  it("get array with two users by sort createdAt DESC", async () => {
    const response = await request(httpServer)
      .get("/sa/users")
      .query({ sortDirection: "DESC" })
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    console.log(response.body, 'body--DESC---');
    expect(response.body).toEqual({
      "pagesCount": 1,
      "page": 1,
      "pageSize": 10,
      "totalCount": 2,
      "items": [
        {
          "id": userId2,
          "login": "user2",
          "email": "user2@gmail.com",
          "createdAt": expect.any(String)
        },
        {
          "id": userId1,
          "login": "user1",
          "email": "user1@gmail.com",
          "createdAt": expect.any(String)
        },
      ]
    });
  });
  it("get array with two users by sort createdAt ASC", async () => {
    const response = await request(httpServer)
      .get("/sa/users")
      .query({ sortDirection: "ASC" })
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    console.log(response.body, 'body--ASC---');
    expect(response.body).toEqual({
      "pagesCount": 1,
      "page": 1,
      "pageSize": 10,
      "totalCount": 2,
      "items": [
        {
          "id": userId1,
          "login": "user1",
          "email": "user1@gmail.com",
          "createdAt": expect.any(String)
        },
        {
          "id": userId2,
          "login": "user2",
          "email": "user2@gmail.com",
          "createdAt": expect.any(String)
        }
      ]
    });
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
      .get("/sa/users/banned")
      .query({ sortDirection: "ASC" })
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