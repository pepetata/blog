const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    userName: "Flavio",
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    userName: "Flavio",
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    userName: "Flavio",
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    userName: "John Smith",
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    userName: "John Smith",
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    userName: "John Smith",
  },
];
const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon", url: "xxx" });
  await blog.save();
  await blog.deleteOne();
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

//////////////////////////////////////////// users
const initialUsers = [
  {
    username: "root",
    name: "Superuser",
    password: "salainen",
  },
  {
    username: "flavio",
    name: "Flavio",
    password: "admin",
  },
  {
    username: "john",
    name: "John Smith",
    password: "johnny",
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const nonExistingUserId = async () => {
  const user = new User({
    username: "willremovethissoon",
    name: "will remove",
    password: "remove",
  });
  await user.save();
  await user.deleteOne();

  return user._id.toString();
};

///////////////////////////////////////////////// login
async function loginUser(api, username, password) {
  const resp = await api.post("/api/login").send({ username, password });
  // console.log(`========== test_helper loginUser resp,body `, resp.body);
  return resp.body.token;
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  initialUsers,
  nonExistingUserId,
  usersInDb,
  loginUser,
};
