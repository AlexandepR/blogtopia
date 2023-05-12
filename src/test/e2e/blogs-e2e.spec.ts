import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../app.module";
import * as request from "supertest";

const blog1 = {
  name: "testBlog1",
  description: "testBlogDescription1",
  websiteUrl: "https://testBlogWebSite.com1"
};
const blog2 = {
  name: "testBlog2",
  description: "testBlogDescription2",
  websiteUrl: "https://testBlogWebSite.com2"
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
const post3 = {
  title: "post3",
  shortDescription: "descriptionPost3",
  content: "contentPost3",
  blogId: ""
};
const post4 = {
  title: "post4",
  shortDescription: "descriptionPost4",
  content: "contentPost4",
  blogId: ""
};
const post5 = {
  title: "post5",
  shortDescription: "descriptionPost5",
  content: "contentPost5",
  blogId: ""
};
const post6 = {
  title: "post6",
  shortDescription: "descriptionPost6",
  content: "contentPost6",
  blogId: ""
};
const post7 = {
  title: "post7",
  shortDescription: "descriptionPost7",
  content: "contentPost7",
  blogId: ""
};
const post8 = {
  title: "post8",
  shortDescription: "descriptionPost8",
  content: "contentPost8",
  blogId: ""
};
const post9 = {
  title: "post9",
  shortDescription: "descriptionPost9",
  content: "contentPost9",
  blogId: ""
};
const post10 = {
  title: "post10",
  shortDescription: "descriptionPost10",
  content: "contentPost10",
  blogId: ""
};
const post11 = {
  title: "post11",
  shortDescription: "descriptionPost11",
  content: "contentPost11",
  blogId: ""
};
const post12 = {
  title: "post12",
  shortDescription: "descriptionPost12",
  content: "contentPost12",
  blogId: ""
};
let blogId1 = "";
let blogId2 = "";
let post1Id = "";
let post2Id = "";

describe("e2e test for Blog", () => {
  let app: INestApplication;
  let connection;
  let httpServer;
  // const managementToken = {
  //   key: 'management-auth-token',
  //   value: ''
  // }
  beforeAll(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    // connection = moduleFixture.get<QuizService>(QuizService).getMongoConnection();
    app = moduleFixture.createNestApplication();
    // app.useGlobalPipes(new ValidationBodyPipe());

    await app.init();

    httpServer = app.getHttpServer();
    // await request(httpServer)
    //   .delete('testing/all-data');
  });

  afterAll(async () => {
    //clear collection
    // const collections = connection.collection;
    // for (const key in collections) {
    //   const collection = collections[key];
    //   await collection.deleteMany({})
    // }
    await app.close();
  });
  it("All data is deleted", async () => {
    // await startApp();
    await request(httpServer)
      .delete("/testing/all-data")
      .expect(204);
  });
  it("Should return length equal zero", async () => {
    const getBlogs = await request(httpServer)
      .get("/blogs")
      .expect(200);
    let blogs = getBlogs.body;
    expect(blogs.items.length).toBe(0);
  });
  it("Should create new blog and return", async () => {
    const createBlog1 = await request(httpServer)
      .post("/blogs")
      // .set('Authorization', basicAuth)
      .send(blog1)
      .expect(201);
    // const createBlog2 = await request(app)
    //   .post('/blogs')
    //   .set('Authorization', basicAuth)
    //   .send(blog2)
    //   .expect(201);
    blogId1 = createBlog1.body.id;
    // blogId2 = createBlog2.body.id;
    expect(createBlog1.body).toEqual({
      id: expect.any(String),
      name: "testBlog1",
      description: "testBlogDescription1",
      websiteUrl: "https://testBlogWebSite.com1",
      createdAt: expect.any(String),
      isMembership: false
    });
  });
  it("should create new post1 for blog1", async () => {
    const newPost = await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send({
        title: post1.title,
        shortDescription: post1.shortDescription,
        content: post1.content
      })
      .expect(201);
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
        .get(`/blogs/645e62ec11c8f44c852ec699/posts`)
        .expect(404);
    });
  it("should return error for POST posts error if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .post(`/blogs/645e62ec11c8f44c852ec699/posts`)
        .send(post2)
        .expect(404);
    });
  it("should return error for GET Blogs if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .get(`/blogs/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for PUT Blogs if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .put(`/blogs/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for DELETE Blogs if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .delete(`/blogs/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for GET Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .get(`/posts/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for PUT Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .put(`/posts/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should return error for DELETE Posts if :id from uri param not found; status 404;",
    async () => {
      await request(httpServer)
        .delete(`/posts/645e62ec11c8f44c852ec699`)
        .expect(404);
    });
  it("should get post content: posts for specific blog with pagination,return status 200;", async () => {
    const posts1 = await request(httpServer)
      .get(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      // .send({
      //   title: post1.title,
      //   shortDescription: post1.shortDescription,
      //   content: post1.content
      // })
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
            "title": 'post1',
            "shortDescription": 'descriptionPost1',
            "content": 'contentPost1',
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
        }))
  })
  it('should create 11 post and status 200', async () => {
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post2)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post3)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post4)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post5)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post6)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post7)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post8)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post9)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post10)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post11)
      .expect(201);
    await request(httpServer)
      .post(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .send(post12)
      .expect(201);
  })
  it("should get 12 post ,return status 200;", async () => {
    const posts1 = await request(httpServer)
      .get(`/blogs/${blogId1}/posts`)
      // .set('Authorization', basicAuth)
      .expect(200);
    expect(posts1.body).toStrictEqual(
      expect.objectContaining(
        {
          "pagesCount": 2,
          "page": 1,
          "pageSize": 10,
          "totalCount": 12,
          "items": expect.any(Array)
        }))
  })
  it('should delete blog', async () => {
    await request(httpServer)
      .delete(`/blogs/${blogId1}`)
      .expect(204);
  })

});