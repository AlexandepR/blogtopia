import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { settingsEnv } from "../../settings/settings";
import { basicAuth, createUser, getAppAndCleanDB } from "./test-utils";


describe("Test admin for users", () => {
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    httpServer = await getAppAndCleanDB();
  });

  afterAll(async () => {
    await app.close();
  });

  let userId1;
  let userId2;
  let blogId1 = "";
  let post1Id = "";
  let post2Id = "";
  const blog1 = {
    name: "testBlog1",
    description: "testBlogDescription1",
    websiteUrl: "https://testBlogWebSite1.com"
  };
  const post1 = {
    title: "post1",
    shortDescription: "descriptionPost1",
    content: "contentPost1",
    blogId: ""
  };
  const post2 = {
    title: "post2",
    shortDescription: "descriptionPost2",
    content: "contentPost2",
    blogId: ""
  };
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
        "createdAt": expect.any(String)
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
        "createdAt": expect.any(String)
      }
    );
    userId2 = response.body.id;
  });
  it("Should return length equal zero for Blog", async () => {
    const getBlogs = await request(httpServer)
      .get("/sa/blogs")
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    let blogs = getBlogs.body;
    expect(blogs.items.length).toBe(0);
  });
  it("Should create new blog and return", async () => {
    const createBlog1 = await request(httpServer)
      .post("/sa/blogs")
      .set("Authorization", `Basic ${basicAuth}`)
      .send(blog1)
      .expect(201);
    blogId1 = createBlog1.body.id;
    expect(createBlog1.body).toEqual({
      id: expect.any(String),
      name: "testBlog1",
      description: "testBlogDescription1",
      websiteUrl: "https://testBlogWebSite1.com",
      createdAt: expect.any(String),
      isMembership: false
    });
  });
  it("should create new post1 for blog1", async () => {
    const newPost = await request(httpServer)
      .post(`/sa/blogs/${blogId1}/posts`)
      .set("Authorization", `Basic ${basicAuth}`)
      .send({
        title: post1.title,
        shortDescription: post1.shortDescription,
        content: post1.content
      })
      .expect(201);               //create post 1
    post1Id = newPost.body.id;
    expect(newPost.body).toStrictEqual(
      expect.objectContaining({
        "id": expect.any(String),
        "title": "post1",
        "shortDescription": "descriptionPost1",
        "content": "contentPost1",
        "blogId": expect.any(String),
        "blogName": "testBlog1",
        "createdAt": expect.any(String),
        "extendedLikesInfo": {
          "likesCount": 0,
          "dislikesCount": 0,
          "myStatus": "None",
          "newestLikes": []
        }
      })
    );
  });
  it("should return error for GET posts error if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .get(`/sa/blogs/645e62ec11c8f44c852ec699/posts`)
        .expect(404);
    });
  it("should return error for POST posts error if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .post(`/sa/blogs/645e62ec11c8f44c852ec699/posts`)
        .set("Authorization", `Basic ${basicAuth}`)
        .send(post2)
        .expect(404);
    });
  it("should return error for PUT Blogs if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .put(`/sa/blogs/`)
        .set("Authorization", `Basic ${basicAuth}`)
        .expect(404);
    });
  it("should return error for DELETE Blogs if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .delete(`/sa/blogs/645e62ec11c8f44c852ec699`)
        .set("Authorization", `Basic ${basicAuth}`)
        .expect(404);
    });
  it("should return error for GET Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .get(`/sa/posts/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for PUT Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .put(`/sa/posts/`)
        .set("Authorization", `Basic ${basicAuth}`)
        .expect(404);
    });
  it("should return error for DELETE Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .delete(`/sa/posts/645e62ec11c8f44c852ec699`)
        .set("Authorization", `Basic ${basicAuth}`)
        .expect(404);
    });
  it("should get post content: posts for specific blog with pagination,return status 200;", async () => {
    const posts1 = await request(httpServer)
      .get(`/sa/blogs/${blogId1}/posts`)
      .set("Authorization", `Basic ${basicAuth}`)
      .expect(200);
    expect(posts1.body).toStrictEqual(
      expect.objectContaining(
        {
          "pagesCount": 1,
          "page": 1,
          "pageSize": 10,
          "totalCount": 1,
          "items": [{
            "id": expect.any(String),
            "title": "post1",
            "shortDescription": "descriptionPost1",
            "content": "contentPost1",
            "blogId": blogId1,
            "blogName": "testBlog1",
            "createdAt": expect.any(String),
            "extendedLikesInfo": {
              "likesCount": 0,
              "dislikesCount": 0,
              "myStatus": "None",
              "newestLikes": []
            }
          }]
        }));
  });
});