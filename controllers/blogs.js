const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const Blog = require("../models/blog");

/////////////////////////////////////////////////////  gets
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  // console.log(`================blog`, blog);
  if (blog) {
    response.json(blog);
  } else {
    return response.status(404).json({ error: "blog not found" });
  }
});

/////////////////////////////////////////////////////  posts
blogsRouter.post("/", async (request, response) => {
  console.log(`======================= blogsRouter.post body`, request.body);
  const user = request.user;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  console.log(`==========  decodedToken`, decodedToken);
  console.log(`==========  user`, user);
  if (!user) {
    return response.status(400).json({ error: "user is missing or not valid" });
  }

  try {
    const blog = new Blog({
      ...request.body,
      user: user._id, // or user.id
    });
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

/////////////////////////////////////////////////////  patch
blogsRouter.patch("/:id", async (request, response) => {
  console.log(`======================= blogsRouter.patch body`, request.body);
  const user = request.user;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  // Added `next` here for error handling
  const id = request.params.id;
  const body = request.body;
  console.log(`===================== id`, id, body);
  ////////////////////////  check if the user has the right to update it
  // get the blog
  const blog = await Blog.findById(id);
  if (!blog) return response.status(404).json({ error: "blog not found" });

  console.log(`----- blog found`, blog);
  if (blog.user.toString() !== user.id)
    return response.status(404).json({ error: "user cannot update this blog" });

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
    context: "query", // Add this for better validator compatibility
  });

  if (!updatedBlog) {
    return response.status(404).json({ error: "blog not found" });
  }

  response.status(200).json(updatedBlog);
});

//////////// add a like
blogsRouter.patch("/:id/likes", async (request, response) => {
  console.log(`======================= blogsRouter.post body`, request.body);
  const id = request.params.id;
  console.log(`===================== id`, id);
  // get the blog
  const blog = await Blog.findById(id);
  if (!blog) return response.status(404).json({ error: "blog not found" });
  console.log(`----- blog found`, blog);

  // Anyone authenticated can like
  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { likes: blog.likes + 1 },
    { new: true }
  );
  response.status(200).json(updatedBlog);
});

/////////////////////////////////////////////////////  deletes
blogsRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;
  console.log(
    `======================= blogsRouter.delete request.params.id`,
    id
  );
  const user = request.user;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  ////////////////////////  check if the user has the right to delete it
  // get the blog
  const blog = await Blog.findById(id);
  if (!blog)
    return response.status(404).json({ error: "Blog to remove not found!" });
  console.log(`----- blog found`, blog);
  // Check if the blog belongs to the user
  if (blog.user.toString() !== user.id)
    return response.status(404).json({ error: "User cannot delete this blog" });
  // If the blog belongs to the user, delete it
  console.log(`----- blog belongs to user, deleting...`);
  // Delete the blog
  const deletedBlog = await Blog.findByIdAndDelete(id);
  if (!deletedBlog) {
    return response.status(404).json({ error: "Blog to remove not found." });
  }
  return response.status(204).end();
});

module.exports = blogsRouter;
