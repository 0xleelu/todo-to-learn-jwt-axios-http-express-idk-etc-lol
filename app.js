const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs").promises;
const JWT_SECRET = "ilovepooja";

const app = express();

/* 
signup✅/signin endpoint✅
get all the todos endpoint ✅
create a todo endpoint ✅
delete a todo endpoint ✅
mark/unmark the todo endpoint ✅
*/

app.use(cors(), express.json());

app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  let user = {};
  let usersData = await fs.readFile("data/users.json", "utf-8");
  usersData = JSON.parse(usersData);
  if (!usersData.users || usersData.users.length === 0) {
    user = {
      username: username,
      password: password,
      id: 1,
    };
  } else {
    const foundUser = usersData.users.find(
      (user) => user.username === username
    );
    if (foundUser) {
      return res.status(409).json({ message: "username exists" });
    } else {
      id = 55;
      user = {
        username: username,
        password: password,
        id: usersData.users[usersData.users.length - 1].id + 1,
      };
    }
  }
  usersData.users.push(user);
  await fs.writeFile("data/users.json", JSON.stringify(usersData));
  return res.status(200).json({ message: "successfully signed up" });
});

app.post("/signin", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  let usersData = await fs.readFile("data/users.json", { encoding: "utf-8" });
  usersData = JSON.parse(usersData);
  const foundUser = usersData.users.find(
    (user) => user.username === username && user.password === password
  );

  if (foundUser) {
    const token = jwt.sign(
      {
        id: foundUser.id,
      },
      JWT_SECRET
    );
    return res
      .status(200)
      .json({ token: token, message: "succesfully signed in!" });
  } else {
    return res.status(401).json({ message: "invalid credentials" });
  }
});

app.post("/create-todo", async function (req, res) {
  const taskTitle = req.body.task;
  let decodedJWT = req.headers.token;

  decodedJWT = jwt.decode(decodedJWT, JWT_SECRET);

  let task = {};
  let tasksData = await fs.readFile("data/todo.json", "utf-8");
  tasksData = JSON.parse(tasksData);
  // should be verifying the specific users tasks than trusting the entire tasksdata. 
  if (!tasksData.tasks || tasksData.tasks.length === 0) {
    task = {
      id: `t1`,
      title: taskTitle,
      completed: false,
      userId: decodedJWT.id,
    };
  } else {
    task = {
      id: `t${
        tasksData.tasks.filter((x) => x.userId === decodedJWT.id).length + 1
      }`,
      title: taskTitle,
      completed: false,
      userId: decodedJWT.id,
    };
  }
  tasksData.tasks.push(task);
  await fs.writeFile("data/todo.json", JSON.stringify(tasksData));
  return res.status(200).json({ message: "succesfully added the task" });
});

app.get("/todos", async function (req, res) {
  let decodedJWT = req.headers.token;
  decodedJWT = jwt.decode(decodedJWT, JWT_SECRET);

  let tasksData = await fs.readFile("data/todo.json", "utf-8");
  tasksData = JSON.parse(tasksData);

  const foundTasks = tasksData.tasks.find(
    (task) => task.userId == decodedJWT.id
  );
  if (foundTasks) {
    return res
      .status(200)
      .json(tasksData.tasks.filter((x) => x.userId === decodedJWT.id));
  } else {
    return res.status(404).json({ message: "no tasks yet" });
  }
});

app.delete("/delete-todo", async function (req, res) {
  let decodedJWT = req.headers.token;
  decodedJWT = jwt.decode(decodedJWT, JWT_SECRET);
  let taskID = req.body.taskID;

  let tasksData = await fs.readFile("data/todo.json", "utf-8");
  tasksData = JSON.parse(tasksData);

  const foundTasks = tasksData.tasks.find(
    (x) => x.userId === decodedJWT.id && x.id == taskID
  );
  tasksData.tasks = tasksData.tasks.filter((x) => x !== foundTasks);
  await fs.writeFile("data/todo.json", JSON.stringify(tasksData));
  return res
    .status(200)
    .json({ message: `${foundTasks.title} has been successfully deleted` });
});

app.put("/task-status", async function (req, res) {
  let decodedJWT = req.headers.token;
  decodedJWT = jwt.decode(decodedJWT, JWT_SECRET);
  let taskID = req.body.taskID;
  const statusOfTask = req.body.statusOfTask;

  let tasksData = await fs.readFile("data/todo.json", "utf-8");
  tasksData = JSON.parse(tasksData);

  tasksData.tasks.forEach((x) => {
    if (x.id == taskID) {
      x.completed = statusOfTask;
    }
  });

  await fs.writeFile("data/todo.json", JSON.stringify(tasksData));
  return res
    .status(200)
    .json({ message: `the task has been marked successfully` });
});

app.listen("3000");
