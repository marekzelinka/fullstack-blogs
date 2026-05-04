import { useState, useEffect, useRef } from "react";

import { AddBlogForm } from "./components/add-blog-form.jsx";
import { Alert } from "./components/alert.jsx";
import { BlogList } from "./components/blog-list.jsx";
import { Footer } from "./components/footer.jsx";
import { LoginForm } from "./components/login-form.jsx";
import { Togglable } from "./components/togglable.jsx";
import { UserCard } from "./components/user-card.jsx";
import { loginApi, blogsApi } from "./lib/api.js";

export function App() {
  const [alert, setAlert] = useState(null);
  const alertTimeoutIdRef = useRef();

  const notify = (message, { variant = "success" } = {}) => {
    if (alertTimeoutIdRef.current) {
      clearTimeout(alertTimeoutIdRef.current);
    }

    setAlert({ variant, message });
    const timeoutId = setTimeout(() => setAlert(null), 3500);

    alertTimeoutIdRef.current = timeoutId;
  };

  const [user, setUser] = useState(() => {
    const userValue = localStorage.getItem("user");
    if (!userValue) {
      return null;
    }

    try {
      return JSON.parse(userValue);
    } catch {
      return null;
    }
  });

  const login = async ({ username, password }) => {
    try {
      const data = await loginApi.login({ username, password });
      const loggedInUser = { username: data.username, name: data.name };
      setUser(loggedInUser);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      notify(error.response.data.error, { variant: "error" });

      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const [blogs, setBlogs] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    blogsApi.getAll().then(setBlogs);
  }, [user]);

  const addBlog = async ({ title, author, url }) => {
    const blogObject = { title, author, url };

    try {
      const createdBlog = await blogsApi.create(blogObject);
      setBlogs((prevBlogs) => prevBlogs.concat(createdBlog));

      notify(`New blog "${title}" by "${author}" added`);

      return { success: true };
    } catch (error) {
      notify(error.response.data.error, { variant: "error" });

      return { success: false };
    }
  };

  const likeBlog = async (id) => {
    const existingBlog = blogs.find((blog) => blog.id === id);

    try {
      const updatedBlog = await blogsApi.like(id);
      setBlogs((prevBlogs) => prevBlogs.map((blog) => (blog.id === id ? updatedBlog : blog)));
    } catch {
      notify(
        `Blog "${existingBlog.title}" by "${existingBlog.author}"  was already deleted from server`,
        {
          variant: "error",
        },
      );

      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
  };

  const deleteBlog = async (id) => {
    const existingBlog = blogs.find((blog) => blog.id === id);

    try {
      await blogsApi.delete(id);

      notify(`Deleted "${existingBlog.title}" by "${existingBlog.author}"`, { variant: "info" });
    } catch {
      notify(`Note "${existingBlog.content}" was already removed from server`, {
        variant: "error",
      });
    } finally {
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
  };

  return (
    <>
      <header>
        <h1>Fullstack Blogs</h1>
        {user ? <UserCard user={user} onLogout={logout} /> : null}
        {alert ? <Alert {...alert} /> : null}
      </header>
      <main>
        {user ? (
          <>
            <section>
              <Togglable openButtonLabel="Add New Blog">
                <h2>Add a New Blog</h2>
                <AddBlogForm onSubmit={addBlog} />
              </Togglable>
            </section>
            <section>
              <h2>Saved Blogs</h2>
              {blogs ? (
                blogs.length ? (
                  <>
                    <BlogList blogs={blogs} user={user} onLike={likeBlog} onDelete={deleteBlog} />
                  </>
                ) : (
                  <p>No blogs found...</p>
                )
              ) : (
                <p>Loading blogs...</p>
              )}
            </section>
          </>
        ) : (
          <section>
            <Togglable openButtonLabel="User Login">
              <h2>Login with your username</h2>
              <LoginForm onSubmit={login} />
            </Togglable>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
