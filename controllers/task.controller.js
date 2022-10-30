const { sendResponse, AppError } = require("../helpers/utils");
const Task = require("../models/Task");
const User = require("../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

const taskController = {};

taskController.createTask = async (req, res, next) => {
  const data = req.body;

  try {
    //check missing infomations
    if (!data.title || !data.description)
      throw new AppError(400, "Missing title/description ", "Bad Request");

    //check existence task
    const existenceTask = await Task.findOne({ title: data.title });
    if (existenceTask)
      throw new AppError(400, "Task is existed", "Bad request");

    const createdTask = await Task.create(data);
    sendResponse(res, 200, true, createdTask, null, "Create task successfully");
  } catch (error) {
    next(error);
  }
};

taskController.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const { status, owner } = update;
  const allowUpdate = ["working", "review", "done", "archive"];
  try {
    //check invalid mongo object id
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Invalid ObjectId", "Bad request");

    let task = await Task.findById(id);
    const user = await User.findById(owner);

    //assign task
    const assignTask = task.owner?._id.toString() !== owner;
    if (assignTask && owner) {
      user.task.push(id);
      await user.save();
    }

    //unassign task
    if (!assignTask) {
      user?.task?.pop(id);
      await user.save();
      const updated = await Task.findByIdAndUpdate(
        id,
        { ...update, owner: null },
        { new: true }
      );
      sendResponse(res, 200, true, updated, null, "Unassign task successfully");
    }
    // throw new AppError(
    //   400,
    //   "Bad request",
    //   "A task may have one or no one asign to it yet"
    // );

    //missing status
    if (!status) throw new AppError(400, "Missing status", "Bad request");

    const currentStatus = allowUpdate.find((e) => e === status);

    //status is set done, it can’t be changed to other value except archive
    if (status === "done") {
      if (currentStatus === "archive") {
        const updated = await Task.findByIdAndUpdate(id, update, { new: true });
        sendResponse(res, 200, true, updated, null, "update task successfully");
      } else
        throw new AppError(
          400,
          "Done task just store as archive status",
          "Bad request"
        );
    }

    //not allow status
    if (!currentStatus)
      throw new AppError(404, "Status is not allow", "Bad request");

    if ((currentStatus && assignTask) || (currentStatus && !owner)) {
      const updated = await Task.findByIdAndUpdate(id, update, { new: true });
      sendResponse(res, 200, true, updated, null, "update task successfully");
    }
  } catch (error) {
    next(error);
  }
};

taskController.getTaskById = async (req, res, next) => {
  const { id } = req.params;

  try {
    //check invalid mongo object id
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Invalid ObjectId", "Bad request");

    const task = await Task.findById(id).populate("owner");
    //check task is not found
    if (!task) throw new AppError(404, "Task is not found", "Bad request");
    sendResponse(res, 200, true, task, null, "Get task successfully");
  } catch (error) {
    next(error);
  }
};

taskController.getTasks = async (req, res, next) => {
  let { page, limit, owner, status, search } = req.query;

  limit = parseInt(limit) || 5;
  page = parseInt(page) || 1;

  try {
    //Single query
    let filter = {};

    if (status) filter = { status, isDeleted: false };

    if (owner) filter = { owner, isDeleted: false };

    if (search)
      filter = {
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
      };

    // 2 query
    if (status && owner) filter = { status, owner, isDeleted: false };

    if (status && search)
      filter = {
        status,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    if (search && owner)
      filter = {
        owner,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    // 3 query

    if (search && owner && status)
      filter = {
        owner,
        status,
        $or: [
          { description: { $regex: `.*${search}.*` }, isDeleted: false },
          { title: { $regex: `.*${search}.*` }, isDeleted: false },
        ],
        isDeleted: false,
      };

    const task = await Task.find(filter)
      .populate("owner")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Task.find({ isDeleted: false }).count();

    sendResponse(
      res,
      200,
      true,
      { task, total },
      null,
      "get task successfully"
    );
  } catch (error) {
    next(error);
  }
};

taskController.deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    //validate input
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Invalid ObjectId");

    const deleted = {
      isDeleted: true,
    };
    const task = await Task.findByIdAndUpdate(id, deleted, { new: true });

    if (!task) throw new AppError(404, "Bad request", "Task is not found");
    //send res
    sendResponse(res, 200, true, task, null, "Delete task successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
