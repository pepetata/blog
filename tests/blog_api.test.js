const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);
const username = "flavio";
const password = "admin";
let token, loggedUser;

// tests to do:
// get all:
//  - return as json
//  - all data is returned
//  - specific data in among all data returned

// get specific data:
//  - get with valid data
//  - get invalid data

// post:
//  - valid data
//  - missing data
//  - user is not the owner of the data
//  - invalid data
//  - no token
//  - invalid token

// patch or put:
//  - valid data
//  - missing data
//  - invalid data
//  - non existing data on the db
//  - no token
//  - invalid token

// delete:
//  - valid data
//  - user is not the owner of the data
//  - non existing data on the db
//  - no token
//  - invalid token

describe("Blogs", () => {
  //////////////////////////////////////////////////// initialize database
  beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    // add all users
    // await User.insertMany(helper.initialUsers);
    for (const user of helper.initialUsers) {
      await api.post("/api/users").send(user);
    }

    // add all blogs
    const blogsToInsert = await Promise.all(
      helper.initialBlogs.map(async (blog) => ({
        ...blog,
        user: (await User.findOne({ name: blog.userName })).id,
      }))
    );
    await Blog.insertMany(blogsToInsert);

    // login to the user and set token
    token = await helper.loginUser(api, username, password);
    // get the user
    loggedUser = await User.findOne({ username: username });
  });

  ////////////////////////////////////////////////// gets
  describe("Test GET ALL", () => {
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs");
      assert.strictEqual(response.body.length, helper.initialBlogs.length);
    });

    test("a specific blog is within the returned blogs", async () => {
      const response = await api.get("/api/blogs");
      const titles = response.body.map((e) => e.title);
      titles;
      assert(titles.includes("React patterns"));
    });
  });

  describe("Test GET specific", () => {
    test("a specific blog can be viewed", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const expectedBlog = { ...blogToView, user: blogToView.user?.toString() };
      assert.deepStrictEqual(resultBlog.body, expectedBlog);
    });

    test("fails to get non-existing data", async () => {
      const nonExistentId = await helper.nonExistingId();
      // console.log(`============================ nonExistentId`, nonExistentId);

      const response = await api
        .get(`/api/blogs/${nonExistentId}`)
        .expect(404)
        .expect("Content-Type", /application\/json/);

      assert(response.body.error.includes("not found"));
    });
  });

  // ////////////////////////////////////////////////// posts
  describe("Test POST", () => {
    test("succeeds to add with valid data", async () => {
      const newBlog = {
        title: "My test",
        author: "My author",
        url: "my url",
        likes: 0,
        user: loggedUser.id,
      };

      const response = await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const titles = blogsAtEnd.map((n) => n.title);
      assert(titles.includes("My test"));
      assert.strictEqual(response.body.likes, 0);
    });

    test("fails to add with missing data", async () => {
      const newBlog = {
        author: "My author",
        likes: 0,
      };
      const response = await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
        .send(newBlog)
        .expect(400);
      assert(response.body.error.includes("title"));
      assert(response.body.error.includes("url"));
    });

    test("fails to add with invalid data", async () => {
      const newBlog = {
        author: "XX",
        url: "YY",
      };
      const response = await api
        .post("/api/blogs")
        .auth(token, { type: "bearer" })
        .send(newBlog)
        .expect(400);
      assert(response.body.error.includes("title"));
      assert(response.body.error.includes("url"));
    });

    test("fails to add data with invalid token", async () => {
      const newBlog = {
        author: "Invalid token",
      };
      await api
        .post("/api/blogs")
        .auth(token + "invalid", { type: "bearer" })
        .send(newBlog)
        .expect(401);
    });

    test("returns 401 if no token is provided", async () => {
      const newBlog = {
        author: "No token",
      };
      const response = await api.post("/api/blogs").send(newBlog).expect(401);
      assert(response.body.error.includes("invalid token"));
    });
  });

  ////////////////////////////////////////////////// patch
  describe("Test PATCH", () => {
    test("update a field of valid data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const changeBody = { author: "Flavio" };
      const changedBlog = await api
        .patch(`/api/blogs/${blogToView.id}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(200);
      assert(changedBlog.body.author.includes("Flavio"));
    });

    test("fail to update - user is not the owner of the data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[blogsAtStart.length - 1];

      const changeBody = { author: "Flavio" };
      const response = await api
        .patch(`/api/blogs/${blogToView.id}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(404);
      assert(response.body.error.includes("user cannot delete this blog"));
    });

    test("fail to update a field of missing data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const changeBody = { title: "", url: "" };
      const response = await api
        .patch(`/api/blogs/${blogToView.id}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(400);
      assert(response.body.error.includes("title"));
      assert(response.body.error.includes("url"));
    });

    test("fail to update a field of invalid data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToView = blogsAtStart[0];

      const changeBody = { title: "XX", url: "YY" };
      const response = await api
        .patch(`/api/blogs/${blogToView.id}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(400);
      assert(response.body.error.includes("title"));
      assert(response.body.error.includes("url"));
      assert(response.body.error.includes("minimum"));
    });

    test("returns 404 when updating non-existent data", async () => {
      const nonExistentId = await helper.nonExistingId();
      const changeBody = { author: "Flavio" };
      const response = await api
        .patch(`/api/blogs/${nonExistentId}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(404);
      assert(response.body.error.includes("not found"));
    });

    test("fails to update data with invalid token", async () => {
      const existentId = await helper.initialBlogs[0];
      const changeBody = { author: "Flavio" };
      const response = await api
        .patch(`/api/blogs/${existentId}`)
        .send(changeBody)
        .expect(401);
      // console.log(`============== `, response.body);
      assert(response.body.error.includes("invalid token"));
    });

    test("fails to update data with no token", async () => {
      const existentId = await helper.initialBlogs[0];
      const changeBody = { author: "Flavio" };
      const response = await api
        .patch(`/api/blogs/${existentId}`)
        .auth(token + "invalid", { type: "bearer" })
        .send(changeBody)
        .expect(401);
      assert(response.body.error.includes("invalid token"));
    });
  });

  //////////////////////////////////////////////// delete
  describe("Test DELETE", () => {
    test("succeeds to delete valid data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .auth(token, { type: "bearer" })
        .expect(204);
      const blogsAtEnd = await helper.blogsInDb();
      const titles = blogsAtEnd.map((n) => n.title);
      assert(!titles.includes(blogToDelete.title));
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });

    test("fail to delete - user is not the owner of the data", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[blogsAtStart.length - 1];

      const response = await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .auth(token, { type: "bearer" })
        .expect(404);
      assert(response.body.error.includes("user cannot delete this blog"));
    });

    test("fails to delete non-existing data", async () => {
      const nonExistentId = await helper.nonExistingId();
      const response = await api
        .delete(`/api/blogs/${nonExistentId}`)
        .auth(token, { type: "bearer" })
        .expect(404);
      assert(response.body.error.includes("not found"));
    });

    test("fails to delete data with invalid token", async () => {
      const nonExistentId = await helper.nonExistingId();
      const response = await api
        .delete(`/api/blogs/${nonExistentId}`)
        .auth(token + "invalid", { type: "bearer" })
        .expect(401);
      assert(response.body.error.includes("invalid token"));
    });

    test("fails to delete data with no token", async () => {
      const nonExistentId = await helper.nonExistingId();
      const response = await api
        .delete(`/api/blogs/${nonExistentId}`)
        .expect(401);
      assert(response.body.error.includes("invalid token"));
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
