const mongoose = require('mongoose');

// Task Schema
const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: false,
    default: null
  },
  priority: {
    type: Number,
    default: 0,
    required: false
  },
  status: {
    type: Number,
    default: 0
  }
}, { timestamps: true });
const Task = mongoose.model('Task', taskSchema);
module.exports.Task = Task;
