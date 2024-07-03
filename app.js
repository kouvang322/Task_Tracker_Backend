require('dotenv').config();
const jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');
const dbFunctions = require('./db/initDb')
const app = express();
const port = 3000;

// dbFunctions.createTask();

app.use(cors({
  origin: 'http://localhost:4200' // Angular dev server
}));
app.use(express.json()); // To parse JSON bodies

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });

});

// dbFunctions.createTable();

app.get('/api/data', async (req, res) => { // Make the handler async
  try {
    const tasksList = await dbFunctions.getAllTasks(); // Await the getAllTasks function
    res.json(tasksList); // Send the tasks as JSON response
    // console.log(tasksList);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


app.post('/api/data/createTask', async (req, res) => {
  const newTaskinfo = req.body.newTask;
  try {
    const createdTask = await dbFunctions.createNewTask(newTaskinfo);
    res.json(createdTask);
  } catch (error) {
    console.log(error);
  }
});

app.patch('/api/data/updateTask', async (req, res) => {
  // const taskId = req.body.task.id;
  // console.log(taskId)
  const updatedData = req.body.task;
  console.log(updatedData);
  const updatedTask = await dbFunctions.updateTask(updatedData)
  res.json({    
    updatedTask,
    message: 'task updated'
  });
});


app.delete('/api/data/deleteTask/:id', async (req, res) => {
  const taskId = req.params.id;
  await dbFunctions.deleteTask(taskId);
  res.json({
    message: 'task deleted'
  });
});

app.post('/LoginOrRegister/api/data/register', async (req, res) => {
  const newUsernameInput = req.body.newUsername;
  const newPasswordInput = req.body.newPassword;
  const addedUser = await dbFunctions.addUser(newUsernameInput, newPasswordInput);

  console.log(addedUser);

  res.json({
    addedUser
  })
})

app.post('/LoginOrRegister/api/data/login/user', async (req, res) => {
  try {
    const loginUserName = req.body.username;
    const loginPassword = req.body.password;
    // console.log(loginUserName);
    // console.log(loginPassword);

    const result = await dbFunctions.checkForUserData(loginUserName, loginPassword);

    console.log(result);

    if (result.success) {
      const token = jwt.sign({ userId: result.userLoggedIn.userid }, 'your-secret-key', { expiresIn: '1h' });

      res.status(200).json({ 
        message: result.message,
        token: token 
      });
      
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});