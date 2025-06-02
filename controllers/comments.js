const commentsRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const Comment = require("../models/comment");
const Blog = require("../models/blog");
// const User = require("../models/user");

/////////////////////////////////////////////////////  gets
commentsRouter.get("/", async (req, res) => {
  const { blogId } = req.query;
  let query = {};
  if (blogId) query.blogId = blogId;
  const comments = await Comment.find(query).populate("user", {
    username: 1,
    name: 1,
  });
  res.json(comments);
});

/////////////////////////////////////////////////////  posts
commentsRouter.post("/", async (request, response) => {
  console.log(`======================= commentsRouter.post body`, request.body);
  const user = request.user;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  // console.log(`==========  decodedToken`, decodedToken);
  // console.log(`==========  user`, user);
  if (!user) {
    return response.status(400).json({ error: "user is missing or not valid" });
  }

  const blog = await Blog.findById(request.body.blogId);

  try {
    const comment = new Comment({
      ...request.body,
      // blogId: blogId,
      user: user._id,
      date: new Date(),
    });
    const savedComment = await comment.save();
    user.comments = user.comments.concat(savedComment._id);
    await user.save();
    blog.comments = blog.comments.concat(savedComment._id);
    await blog.save();
    // response.status(201).json(savedComment);
    const populatedComment = await savedComment.populate("user", {
      username: 1,
      name: 1,
    });
    response.status(201).json(populatedComment);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = commentsRouter;
