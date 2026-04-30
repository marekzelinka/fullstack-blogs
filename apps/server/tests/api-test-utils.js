import { Blog } from "../src/models/blog.js";
import { User } from "../src/models/user.js";

export function getInitialBlogs(userId) {
  return [
    {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      owner: userId,
    },
    {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      owner: userId,
    },
  ];
}

export async function getNonExistingBlogId(userId) {
  const blog = new Blog({
    title: "willremovethissoon",
    author: "willremovethissoon",
    url: "https://willremovethissoon.com",
    owner: userId,
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
}

export async function getBlogsInDb() {
  const blogs = await Blog.find();

  return blogs.map((doc) => {
    const blog = doc.toJSON();

    return { ...blog, owner: blog.owner.toString() };
  });
}

export const initialUser = {
  username: "root",
  name: "Admin User",
  password: "sekreeet",
};

export async function getUsersInDb() {
  const users = await User.find();

  return users.map((user) => user.toJSON());
}
