require('dotenv').config();
const jwt = require('jsonwebtoken');

const express = require('express');
const cors = require('cors');
const dbFunctions = require('./db/initDb')
const app = express();
const port = process.env.PORT || 3000;

// dbFunctions.createTask();

app.use(cors({
  origin: process.env.FRONTEND_URL.split(','),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));


app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });

});


// dbFunctions.createTable();

app.get('/dashboard/api/data/:id', async (req, res) => { // Make the handler async
  const user_id = req.params.id
  console.log(user_id);

  try {
    const tasksList = await dbFunctions.getAllTasks(user_id); // Await the getAllTasks function
    res.json(tasksList); // Send the tasks as JSON response
    // console.log(tasksList);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


app.post('/dashboard/api/data/createTask', async (req, res) => {
  const newTaskinfo = req.body.newTask;
  const loggedinUserId = req.body.userId;
  try {
    const createdTask = await dbFunctions.createNewTask(newTaskinfo, loggedinUserId);
    res.json(createdTask);
  } catch (error) {
    console.log(error);
  }
});

app.patch('/dashboard/api/data/updateTask', async (req, res) => {
  // const taskId = req.body.task.id;
  // console.log(taskId)
  const updatedData = req.body.task;
  const loggedInUserId = req.body.user_id;
  console.log(loggedInUserId);
  console.log(updatedData.user_id);

  if(loggedInUserId === updatedData.user_id){
    const updatedTask = await dbFunctions.updateTask(updatedData, loggedInUserId)
    res.json({    
      updatedTask,
      message: 'task updated'
    });
  }else{
    res.json({
      message: "user not authorized"
    })
  }
});


app.delete('/dashboard/api/data/deleteTask/:id', async (req, res) => {
  const taskId = req.params.id;
  await dbFunctions.deleteTask(taskId);
  res.json({
    message: 'task deleted'
  });
});

app.post('/loginOrRegister/api/data/register', async (req, res) => {
  const newUsernameInput = req.body.username;
  const newPasswordInput = req.body.password;
  const canCreateUser = await dbFunctions.addUser(newUsernameInput, newPasswordInput);

  console.log(canCreateUser);

  res.json(
    canCreateUser
  )
})

app.post('/loginOrRegister/api/data/login/user', async (req, res) => {
  try {
    const loginUserName = req.body.username;
    const loginPassword = req.body.password;
    // console.log(loginUserName);
    // console.log(loginPassword);

    const result = await dbFunctions.checkForUserData(loginUserName, loginPassword);

    console.log(result);

    if (result.success) {
      // const token = jwt.sign({ userId: result.userLoggedIn.userid }, jwtSecret, { expiresIn: '1h' });

      res.status(200).json({
          username: result.userLoggedInName, 
          user_id: result.userLoggedInId
      });
      
    } else {
      res.status(401).json(result.message);
    }
  } catch (error) {
    console.error('Error during login', error);
    res.status(500).json('Internal server error');
  }
});

app.listen(port, () => {
  // console.log(`Server is running on http://localhost:${port}`);
  console.log(`Server is running on ${port}`);
  
});