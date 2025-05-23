const mongoose = require("mongoose");

// mode the code below to app.js
// const url = process.env.MONGODB_URI
// console.log('connecting to', url)
// mongoose.set('strictQuery', false)
// mongoose.connect(url)
//   .then(result => {
//     console.log('connected to MongoDB')
//   })
//   .catch(error => {
//     console.log('error connecting to MongoDB:', error.message)
//   })

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    minLength: 3,
    required: [true, "Title is required"],
  },
  author: String,
  url: {
    type: String,
    minLength: 3,
    required: [true, "URL is required"],
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Blog", blogSchema);
