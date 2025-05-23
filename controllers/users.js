const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

/////////////////////////////////////////////////  gets
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    content: 1,
    important: 1,
  });
  response.json(users);
});

/////////////////////////////////////////////////  posts
usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  // console.log(
  //   `============================ usersRouter.post    request.body`,
  //   request.body
  // );
  // check passord
  if (password.length < 3)
    return response.status(400).json({
      error:
        "invalid password (too short - must be at least 3 characters long)",
    });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
