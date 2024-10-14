
window.onload = function () {
  const token = localStorage.getItem("token");
  // Array of avatar image URLs
  const avatarImages = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    // Add more avatar URLs
  ];

  // Function to get a random avatar
  function getRandomAvatar() {
    const randomIndex = Math.floor(Math.random() * avatarImages.length);
    return avatarImages[randomIndex];
  }

  // If no token found, redirect to login page
  if (!token) {
    alert("You need to log in first");
    window.location.href = "/";
    return;
  }

  // Verify the token by making a request to the server
  fetch("/me", {
    headers: {
      token: token, // Send token in headers
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Token is invalid or expired");
      }
      return response.json();
    })
    .then((user) => {
      document.querySelector(
        ".greeting p"
      ).innerHTML = `${greetingMessage} !<br><span class="date">${formattedDate}</span>`;
      // Here you can load the user's tasks from your database if needed
      document.querySelector(".name").textContent = `${user.username}`;

      const avatarElement = document.querySelector(".avatar");
      avatarElement.src = getRandomAvatar();


      var calendarEl = document.getElementById("calendar");
      var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        dateClick: function (info) {
        alert("Date: " + info.dateStr);
        },
      });
      calendar.render();
    })
    .catch((error) => {
      alert(error.message);
      localStorage.removeItem("token"); // Remove the token on error
      window.location.href = "/"; // Redirect to login
    });

  const now = new Date();
  const hour = now.getHours();
  let greetingMessage = "";

  if (hour >= 5 && hour < 12) {
    greetingMessage = "Good Morning ☀️";
  } else if (hour >= 12 && hour < 17) {
    greetingMessage = "Good Afternoon 🕛";
  } else if (hour >= 17 && hour < 21) {
    greetingMessage = "Good Evening 🌟";
  } else {
    greetingMessage = "Good Night 🌙";
  }

  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = `Today, ${now.toLocaleDateString("en-US", options)}`;

};

// Show the modal
function showModal() {
  document.getElementById("taskModal").style.display = "flex";
}

// Close the modal
function closeModal() {
  document.getElementById("taskModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("taskModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

let todos = [];

// Add or update todo
function addOrUpdateTodo(event) {
  event.preventDefault();
  const form = document.getElementById("todoForm");

  const title = form.taskname.value;
  const details = form.details.value;
  const due = form.due.value;
  const urgency = form.urgency.value;
  const taskId = form.taskId.value;

  if (taskId) {
    // Edit existing task
    const taskIndex = todos.findIndex((task) => task.id === parseInt(taskId));
    if (taskIndex !== -1) {
      todos[taskIndex] = {
        id: parseInt(taskId),
        title: title,
        details: details,
        due: due,
        urgency: urgency,
      };
    }
  } else {
    // Add new task
    const newTask = {
      id: Date.now(),
      title: title,
      details: details,
      due: due,
      urgency: urgency,
      completed:false
    };
    todos.push(newTask);
  }

  renderTasks(); // Re-render tasks
  form.reset(); // Clear form
  closeModal(); // Close modal
}


function renderTasks() {
  const tasksContainer = document.querySelector(".tasks-container");
  const inProgressContainer = document.querySelector(".list-inprog");
  const completedContainer = document.querySelector(".list-completed");

  // Clear all task containers
  tasksContainer.innerHTML = "";
  inProgressContainer.innerHTML = "";
  completedContainer.innerHTML = "";

  todos.forEach((task) => {
    const taskElement = createTaskElement(task);
    if (task.completed) {
      completedContainer.appendChild(taskElement); // Add to Completed section
    } else {
      if (task.urgency !== "High") {
        tasksContainer.appendChild(taskElement); // Add to All Tasks section
      } else {
        inProgressContainer.appendChild(taskElement); // Add to In Progress section
      }
    }
  });
}

// Create a new task element
function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  if (task.completed) {
    taskElement.classList.add("completed"); // Add the completed class for styling
  }
  taskElement.setAttribute("data-id", task.id);

  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todoDiv");

  // Add a checkbox for marking as completed
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed || false; // Check if task is already completed
  checkbox.addEventListener("change", () =>
    toggleCompleteTask(task.id, checkbox.checked)
  ); // Add event listener to toggle completion
  todoDiv.appendChild(checkbox);

  // Add an edit button to each task
  const editButton = document.createElement("button");
  editButton.innerHTML = `<i class="fa-solid fa-pencil-alt"></i>`;
  editButton.classList.add("edit-button");
  editButton.onclick = () => showEditOptions(task.id); // Bind click event for editing
  todoDiv.appendChild(editButton);

  const titDiv = document.createElement("div");
  titDiv.classList.add("titDiv");
  titDiv.innerHTML = `${task.title}`;

  const detDiv = document.createElement("div");
  detDiv.classList.add("detDiv");
  detDiv.innerHTML = `${task.details}`;

  const urDiv = document.createElement("div");
  urDiv.classList.add("urDiv");
  urDiv.innerHTML = `${task.urgency}`;

  if (task.urgency.toLowerCase() === "low") {
    urDiv.style.color = "#6CA0DC";
  } else if (task.urgency.toLowerCase() === "medium") {
    urDiv.style.color = "#F5E36B";
  } else if (task.urgency.toLowerCase() === "high") {
    urDiv.style.color = "#FF4C4C";
  }

  const dueDiv = document.createElement("div");
  dueDiv.classList.add("dueDiv");
  dueDiv.innerHTML = `<i class="fa-solid fa-calendar-days"></i>&nbsp;${task.due}`;

  taskElement.appendChild(todoDiv); // Add todoDiv containing checkbox and edit button
  taskElement.appendChild(titDiv);
  taskElement.appendChild(detDiv);
  taskElement.appendChild(urDiv);
  taskElement.appendChild(dueDiv);

  return taskElement;
}



function showEditOptions(taskId) {
  const task = todos.find((todo) => todo.id === taskId);

  // Show options to edit or delete
  const editConfirm = confirm(
    `Do you want to edit or delete the task: "${task.title}"?\nClick OK to edit or Cancel to delete.`
  );
  if (editConfirm) {
    // Show modal for editing
    const form = document.getElementById("todoForm");
    form.taskId.value = taskId;
    form.taskname.value = task.title;
    form.details.value = task.details;
    form.due.value = task.due;
    form.urgency.value = task.urgency;
    showModal();
  } else {
    // Delete task
    deleteTask(taskId);
  }
}

    function deleteTask(taskId) {
      todos = todos.filter((todo) => todo.id !== taskId);
      renderTasks();
    }

function toggleCompleteTask(taskId, isCompleted) {
  const taskIndex = todos.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    todos[taskIndex].completed = isCompleted; // Update the completed status
  }

  renderTasks(); // Re-render the task lists
}

// Function to show the calendar in a modal
function showCalendar() {
  const calendarModal = document.getElementById("calendarModal");
  const calendarEl = document.getElementById("calendar");

  // Check if calendar is already initialized
  if (!calendarEl.classList.contains("initialized")) {
    // Initialize the calendar only once
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
    });
    calendar.render();
    calendarEl.classList.add("initialized"); // Mark as initialized to avoid re-initializing
  }

  // Show the calendar modal
  calendarModal.style.display = "block";
}

// Function to close the calendar modal
function closeCalendar() {
  const calendarModal = document.getElementById("calendarModal");
  calendarModal.style.display = "none";
}

// Close modal when clicking outside of the modal
window.onclick = function(event) {
  const calendarModal = document.getElementById("calendarModal");
  if (event.target === calendarModal) {
    closeCalendar();
  }
};


function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open"); // Toggle the 'open' class to show/hide sidebar
}
