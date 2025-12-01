/*
    first i need to let users create their accounts
    later sign them in with their credentials
    afterwards when they have logged in, i should able to create them todos and do the respective stuff.

    - signup ✅
    - signin ✅
    - logout ✅
    - add the todos ✅
    - render the todos ✅
    - mark/unmark the todos ✅
    - delete the todos ✅

*/

// signup endpoint needs body.username and body.password. it returns whether user exisits or new user created successfully.
const signupButton = document.getElementById("signup");
signupButton.addEventListener("click", () => {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  axios
    .post("http://localhost:3000/signup", {
      username: username,
      password: password,
    })
    .catch(function (err) {
      console.log(err);
    });
  alert("signed up!");
});

const signinButton = document.getElementById("signin");
signinButton.addEventListener("click", () => {
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;

  axios
    .post("http://localhost:3000/signin", {
      username: username,
      password: password,
    })
    .then(function (response) {
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        renderTodos();
      }
      alert(response.data.message);
    })
    .catch(function (err) {
      console.log(err);
    });
});

//cant able to switch between signup and signin div's idk the issue and it dont want to waste time debugging it

// const signup_or_signin = document.getElementById("signup-or-signin");

// const signButtonShifter = () => {
//   let signup = document.getElementsByClassName("signup")[0];
//   let signin = document.getElementsByClassName("signin")[0];

//   if (signup.style.display === "block") {
//     signup.style.display = "none";
//     signin.style.display = "block";
//   } else {
//     signup.style.display = "block";
//     signin.style.display = "none";
//   }
// };

// signup_or_signin.addEventListener("click", signButtonShifter);

const renderTodos = async () => {
  let response = null;
  if (localStorage.getItem("token")) {
    let signupDiv = document.getElementsByClassName("signup");
    signupDiv[0].style.display = "none";
    let signinDiv = document.getElementsByClassName("signin");
    signinDiv[0].style.display = "none";
    let todosContainer = document.getElementsByClassName("todos");
    todosContainer[0].style.display = "block";

    response = await axios.get("http://localhost:3000/todos", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  }
  console.log(response.data);

  const listOfTodos = document.getElementsByClassName("listOfTodos")[0];
  for (let i = 0; i < response.data.length; i++) {
    console.log(response.data[i]);
    let task = response.data[i];
    const newTaskDiv = document.createElement("div");
    newTaskDiv.setAttribute("id", task.id);

    const title = document.createElement("p");
    title.textContent = task.title;

    const completionButton = document.createElement("button");
    completionButton.setAttribute("id", "completionButton");
    completionButton.setAttribute("value", task.id);

    const deletionButton = document.createElement("button");
    deletionButton.setAttribute("id", "deletionButton");
    deletionButton.setAttribute("value", task.id);
    deletionButton.textContent = "delete";

    if (task.completed) {
      completionButton.textContent = "not completed";
      const striker = document.createElement("s");
      striker.appendChild(title);
      newTaskDiv.appendChild(striker);
    } else {
      completionButton.textContent = "completed";

      newTaskDiv.appendChild(title);
    }
    newTaskDiv.appendChild(completionButton);
    newTaskDiv.appendChild(deletionButton);
    listOfTodos.appendChild(newTaskDiv);
  }
};

const todoSubmit = document.getElementById("todo-submit");
todoSubmit.addEventListener("click", async () => {
  await axios
    .post(
      "http://localhost:3000/create-todo",
      { task: document.getElementById("new-todo").value },
      { headers: { token: localStorage.getItem("token") } }
    )
    .then(alert("succesfully added the task"));
  renderTodos();
});

document.addEventListener("click", async (event) => {
  if (event.target.matches("#completionButton")) {
    let statusOfTask = null;

    const response = await axios.get("http://localhost:3000/todos", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    let taskFound = response.data.filter((x) => x.id === event.target.value);
    statusOfTask = !taskFound[0].completed;

    await axios.put("http://localhost:3000/task-status", {
      taskID: event.target.value,
      statusOfTask: statusOfTask,
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  }

  // axios.delete act differently and it requries you to send data/mention it explicitly.
  if (event.target.matches("#deletionButton")) {
    console.log(event.target.value);
    await axios.delete("http://localhost:3000/delete-todo", {
      data: { taskID: event.target.value },
      headers: {
        token: localStorage.getItem("token"),
      },
    });
  }
});

const logoutbutton = document.getElementById("logout");
logoutbutton.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

renderTodos();
