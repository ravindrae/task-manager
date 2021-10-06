const express = require('express');
const router = express.Router();
const moment = require('moment');

const { Task } = require('../models/task');
const { User } = require('../models/user');

const priorities = { 0: 'Low', 1: 'Medium', 2: 'High'};

router.get('/', ensureAuthenticated, function (req, res) {
  let query = setFilters(req);
    
  Task.find(query, function (err, tasks) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Tasks',
        tasks: tasks,
        type: req.query.type,
        status: req.query.status,
        priorities: priorities
      });
    }
  });
});

router.get('/new', ensureAuthenticated, async (req, res) => {
  res.render('new_task', {
    title: 'Add Task',
    priorities: priorities
  });
});

router.post('/', ensureAuthenticated, async (req, res) => {

  const title = req.body.title;
  const description = req.body.description;
  const priority = req.body.priority;
  const deadline = req.body.deadline;
  // console.log(req.user.name);

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();
  req.checkBody('deadline', 'Deadline is required').notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    res.render('new_task', {
      title: "New Task",
      errors: errors,
      priorities: priorities
    });
  } else {
    let task = await Task.create({
      title: title,
      description: description,
      deadline: deadline,
      priority: priority,
      created_by: req.user._id
    });
    task.save();
    req.flash('success', 'Task added successfully...!');
    res.redirect('/tasks');
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task.created_by != req.user._id) {
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_task', {
      title: 'Edit Task',
      task: task,
      priorities: priorities,
    });
  } catch (e) {
    res.send(e);
  }
});

router.post('/complete/:id', ensureAuthenticated, async (req, res) => {
  try {
    if (!req.user._id) {
      res.status(500).send();
    }
    
    const task = await Task.findById(req.params.id);

    if (task.created_by != req.user._id) {
      res.status(500).send();
    } else {
      task.status = 1;
      task.save();
      res.send('Success');
    };
  } catch (e) {
    res.send(e);
  }

});

// Update Submit POST Route
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = {
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      priority: req.body.priority,
      status: req.body.status
    };

    let query = { _id: req.params.id }

    const update = await Task.updateOne(query, task);
    if (update) {
      req.flash('success', 'Task Updated');
      res.redirect('/tasks');
    } return;

  } catch (e) {
    res.send(e);
  }

});

router.delete('/:id', ensureAuthenticated, async (req, res) => {

  try {
    if (!req.user._id) {
      res.status(500).send();
    }
    let query = { _id: req.params.id }
    const task = await Task.findById(req.params.id);

    if (task.created_by != req.user._id) {
      res.status(500).send();
    } else {
      remove = await Task.findByIdAndRemove(query);
      if (remove) {
        res.send('Success');
      }
    };
  } catch (e) {
    res.send(e);
  }

});

router.get('/:id', ensureAuthenticated, async (req, res) => {
  const task = await Task.findById(req.params.id);
  const user = await User.findById(task.created_by);
  if (user) {
    res.render('task', {
      task: task,
      created_by: user.name
    });
  }
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

function setFilters(req) {
  let query = { created_by: req.user._id };
  let today = new Date(moment().format('YYYY-MM-DD'));

  switch (req.query.type) {      
    case '0':
      query.deadline = today;
      break;
    case '1':
      query.deadline = {
        $gt: today
      };
      break;
    case '2':
      query.deadline = {
        $lt: today
      };
      break;
    default:
      break;
  }

  if(req.query.status === '0' || req.query.status === '1')
    query.status = req.query.status;

    return query;
}

module.exports = router;
