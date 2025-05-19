const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

/////////////////////////////////////////////////////  gets
blogsRouter.get("/", (request, response) => {
  console.log(`get All`);

  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

/////////////////////////////////////////////////////  posts
blogsRouter.post("/", (request, response) => {
  console.log(`body`, request.body);
  request.body;
  const blog = new Blog(request.body);

  blog.save().then((result) => {
    response.status(201).json(result);
  });
});

module.exports = blogsRouter;
