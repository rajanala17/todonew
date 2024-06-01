const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
var isValid = require('date-fns/isValid')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const hasPriorityAndStatus = req => {
  return
  req.priority !== undefined && req.status !== undefined
}
const hasPriority = req => {
  return req.priority !== undefined
}
const hasStatus = req => {
  return req.status !== undefined
}
const hasCategoryAndStatus = req => {
  return req.category !== undefined && req.status !== undefined
}
const hasCategoryAndPriority = req => {
  return req.category !== undefined && req.priority !== undefined
}
const hasSearch = req => {
  return req.search_q !== undefined
}
const hasCategory = req => {
  return req.category != undefined
}
const outPutResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  }
}
//Get
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, category} = request.query
  switch (true) {
    case hasPriorityAndStatus(req.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status == 'DONE'
        ) {
          getTodosQuery = `
                SELECT 
                *
                FROM 
                todo WHERE status = '${status}' AND priority = '${priority}';`
          data = await db.all(getTodosQuery)
          response.send(data.map(i => outPutResult(i)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasCategoryAndStatus(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status == 'DONE'
        ) {
          getTodosQuery = `
          SELECT * FROM todo WHERE category = '${category}' and status = '${status}';`
          data = await db.all(getTodosQuery)
          response.send(data.map(i => outPutResult(i)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryAndPriority(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodosQuery = `
    SELECT * FROM todo WHERE category = '${category}' and priority ='${priority}';`
          data = await db.all(getTodosQuery)
          response.send(data.map(i => outPutResult(i)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasPriority(req.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodosQuery = `
  SELECT * FROM todo WHERE
  priority = '${priority}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(i => outPutResult(i)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasStatus(req.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status == 'DONE') {
        getTodosQuery = `
          SELECT * FROM todo WHERE status = '${status}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(i => outPutResult(i)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasSearch(req.query):
      getTodosQuery = `
      SELECT * FROM todo WHERE todo like '%${search_q}%';`
      data = await db.all(getTodosQuery)
      response.send(data.map(i => outPutResult(i)))
      break
    case hasCategory(req.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodosQuery = `SELECT * FROM todo WHERE category ='${category}';`
        data = await db.all(getTodosQuery)
        response.send(data.map(i => outPutResult(i)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    default:
      getTodosQuery = `
      SELECT * FROM todo;`
      data = await db.all(getTodosQuery)
      response.send(data.map(i => outPutResult(i)))
  }
})
//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const result1 = await db.get(getTodosQuery)
  response.send(outPutResult(result1))
})
//API 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch(date, 'yyyy-MM-dd'))
  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    const getTodosQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`
    const result2 = await db.all(getTodosQuery)
    response.send(result2.map(i => outPutResult(i)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})
//API4
app.post('/todos/:todoId/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status == 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNew = format(new Date(dueDate), 'yyyy-MM-dd')
          const postQuery = `
          INSERT INTO todo (id,todo,priority,status,category,due_date)
          VALUES 
          (${id},'${todo}','${priority}','${status}','${category}','${postNew}');`
          await db.run(postQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})
//API5
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  console.log(requestBody)
  const prevQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const prev = await db.get(prevQuery)
  const {
    todo = prev.todo,
    priority = prev.priority,
    status = prev.status,
    category = prev.category,
    dueDate = prev.dueDate,
  } = request.body
  let updateQuery = ''
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status == 'DONE') {
        updateQuery = `
      UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};`
        await db.run(updateQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        updateQuery = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};`
        await db.run(updateQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case requestBody.todo !== undefined:
      updateQuery = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};
    `
      await db.run(updateQuery)
      response.send('Todo Updated')
      break
    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        updateQuery = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};
    `
        await db.run(updateQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newDueDate = format(new Date(dueDate), 'yyyy-MM-dd')
        updateQuery = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}' WHERE id = ${todoId};
    `
        await db.run(updateQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})
//API6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const del = `
  DELETE 
  FROM todo WHERE id = ${todoId};`
  await db.run(del)
  response.send('Todo Deleted')
})
module.exports = app
