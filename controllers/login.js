const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;
  // console.log(
  //   `================= loginRouter.post  request.body `,
  //   request.body
  // );

  const user = await User.findOne({ username });
  // console.log("User found:", user);
  let passwordCorrect = false;
  if (user) {
    passwordCorrect = await bcrypt.compare(password, user.passwordHash);
  }
  // console.log(`--- user`, user, passwordCorrect);
  if (!(user && passwordCorrect)) {
    // console.log(`------------------- errado`);
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // token expires in 60*60 seconds, that is, in one hour
  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });
  // console.log("About to send response");
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
