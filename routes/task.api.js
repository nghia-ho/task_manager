const express = require("express");
const router = express.Router();
const { createTask, updateTask } = require("../controllers/task.controller");
/**
 * @route POST api/task
 * @descriptions create a new task
 * @access private
 */
router.post("/", createTask);
router.put("/:id", updateTask);

module.exports = router;
