const { sendResponse, AppError } = require("../helpers/utils");
const Task = require("../models/Task");
const { check } = require("express-validator");
const { findOneAndUpdate } = require("../models/Task");

const taskController = {};

taskController.createTask = async (req, res, next) => {
  const data = req.body;

  try {
    if (!data.title || !data.description)
      throw new AppError(400, "Bad Request", "Missing body");

    const existenceTask = await Task.findOne({ title: data.title });
    if (existenceTask)
      throw new AppError(400, "Bad request", "Task is existed");

    const createdTask = await Task.create(data);
    sendResponse(res, 200, true, createdTask, null, "create task successfully");
  } catch (error) {
    next(error);
  }
};

taskController.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const allowUpdate = ["working", "review", "done", "archive"];
  try {
    if (!update.status) throw new AppError(400, "Bad request", "Missing body");

    const stt = allowUpdate.find((e, i) => allowUpdate[i] === update.status);
    if (!stt) throw new AppError(400, "Bad request", "Not allowed value");
    if (stt === "archive") console.log("oke");
    if (stt) {
      const updated = await Task.findByIdAndUpdate(id, update, { new: true });
      sendResponse(res, 200, true, updated, null, "update task successfully");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
