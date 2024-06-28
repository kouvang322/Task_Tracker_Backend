require('dotenv').config();


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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});