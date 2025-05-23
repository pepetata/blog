const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const likesTotal = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce((sum, item) => sum + item.likes, 0);
};

const favoriteBlog = (blogs) => {
  blogs;
  if (blogs.length === 0) return null;
  let max = { likes: 0 };
  blogs.forEach((elem) => {
    elem;
    if (elem.likes > max.likes) max = elem;
  });
  return max;
};

const mostBlogs = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return { author: null, blogs: 0 };
  }

  // Group blogs by author
  const authorCounts = _.countBy(blogs, "author");

  // Find the author with the maximum number of blogs
  const topAuthor = _.maxBy(
    Object.keys(authorCounts),
    (author) => authorCounts[author]
  );

  return {
    author: topAuthor || null,
    blogs: topAuthor ? authorCounts[topAuthor] : 0,
  };
};


const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return { author: null, likes: 0 };
  }

  // Group blogs by author and sum their likes
  const authorLikes = _.reduce(
    blogs,
    (acc, blog) => {
      acc[blog.author] = (acc[blog.author] || 0) + blog.likes;
      return acc;
    },
    {}
  );

  // Find the author with the maximum likes
  const topAuthor = _.maxBy(Object.keys(authorLikes), (author) => authorLikes[author]);

  return {
    author: topAuthor || null,
    likes: topAuthor ? authorLikes[topAuthor] : 0,
  };
};


module.exports = { dummy, likesTotal, favoriteBlog, mostBlogs, mostLikes };
