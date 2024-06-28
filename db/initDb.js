const { Pool } = require('pg');

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false, // This may be necessary for some SSL setups
  },
});


async function createTable() {
  const client = await pool.connect();

  try {
    await client.query('Begin');
  
    await client.query(`
        CREATE TABLE IF NOT EXISTS "Tasks" (
          id SERIAL PRIMARY KEY,
          title VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          priority VARCHAR(15) NOT NULL,
          user_id INTEGER NOT NULL
        );
      `);
  
      
      await client.query('COMMIT');
      console.log('Table created successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating tables', error);
    } finally {
      client.release();
    }
  
    createTable().catch(err => console.error('Error executing createTable', err));
  
}

async function createNewTask(newTaskinfo) {
  const client = await pool.connect();

  const queryCreate = `
    INSERT INTO "Tasks" (title, description, priority, user_id) 
    VALUES($1, $2, $3, $4)
    RETURNING *
  `;

  const taskDataToAdd = {
    title: newTaskinfo.title,
    description: newTaskinfo.description,
    priority: newTaskinfo.priority,
    user_id: 1
  };

  const values = [
    taskDataToAdd.title, 
    taskDataToAdd.description, 
    taskDataToAdd.priority, 
    taskDataToAdd.user_id
  ];

  // const queryGetCreatedTask = `
  //   SELECT * FROM "Tasks"
  //   Where 
  // `;

  
  try {
    const res = await client.query(queryCreate, values);
    // createdTask = res.rows[0];
    console.log('Task created:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting task:', err);
  } finally {
    client.release();
  }
  
}

async function getAllTasks() {
  const client = await pool.connect();
  // create new query to grab all data
      //select * from
  // assign res to the query that will be executed

  const getAllTaskQuery = `
    SELECT * FROM "Tasks"
  `;

  // create an empty array to set the retrieved data to
  let tasks = [];
  try {
    const res = await client.query(getAllTaskQuery);
    tasks = res.rows;  // res.rows is already an array of tasks
    // console.log('Tasks retrieved:', tasks);
  } catch (err) {
    console.error('Error retrieving tasks:', err);
  } finally {
    client.release();
  }
  //return response 
  return tasks;
}

async function updateTask(task){
  const client = await pool.connect();
  console.log(task);
  
  const queryUpdateData = `
    UPDATE "Tasks"
    SET title = '${task.title}', description = '${task.description}',priority = '${task.priority}'
    WHERE id = ${task.id};
  `
  const queryGetNewTaskInfo = `
    SELECT * FROM "Tasks"
    WHERE id = ${task.id}
  `
  
  let updatedItem = [];
  try {
    const res = await client.query(queryUpdateData);
    const getUpdatedTask = await client.query(queryGetNewTaskInfo);
    updatedItem = getUpdatedTask.rows[0];
  } catch (error) {
    console.error('Error retrieving task:', error);
  } finally {
    client.release();
  }
  return updatedItem;
}

async function deleteTask(taskId){
  const client = await pool.connect();

  const queryDeleteTask = `
    DELETE FROM "Tasks"
    Where id = $1
  `
  try {
    const res = await client.query(queryDeleteTask, [taskId]);
  } catch (error) {
    console.error('Error deleting task:', error);
  } finally {
    client.release();
  }
  
}


module.exports = {
  createTable,
  createNewTask,
  getAllTasks,
  updateTask,
  deleteTask,
}