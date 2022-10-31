const { sendResponse, AppError } = require("../helpers/utils");
const User = require("../models/User");
const { check } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

const userController = {};

//Create a new user (assign task)
userController.createUser = async (req, res, next) => {
  const info = req.body;
  try {
    // check name is empty
    if (!info.name)
      throw new AppError(406, "Bad request", "Field name is required");
    // check name is valid string
    // if (check(info.name).isString())
    //   throw new AppError(400, "Field Name must be a string", "Bad request");

    //check existence employee
    const existenceEmployee = await User.findOne({ name: info.name });
    if (existenceEmployee)
      throw new AppError(400, "Bad request", "Employee is existed");

    const created = await User.create(info);
    sendResponse(res, 200, true, created, null, "Create user Success");
  } catch (error) {
    next(error);
  }
};

//Get all User

userController.getAllUser = async (req, res, next) => {
  let { name, limit, page, ...filterQuery } = req.query;

  limit = parseInt(limit) || 5;
  page = parseInt(page) || 1;

  const filterKeys = Object.keys(filterQuery);
  let filter = {};
  try {
    //query  // not alow
    if (filterKeys.length) {
      filterKeys.map((key) => {
        if (!filterQuery[key]) delete filterQuery[key];
      });
      throw new AppError(
        404,
        "Bad request",
        `Query ${filterKeys.map((e) => e)} is not allowed`
      );
    }
    //query
    if (name) filter = { name: name };

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("task");

    const total = await User.find({ isDeleted: false }).count();
    const data = { users, total };

    sendResponse(res, 200, true, data, null, "Search successfully ");
  } catch (error) {
    next(error);
  }
};

//Get single user by Id
userController.getTaskByUserId = async (req, res, next) => {
  const { id } = req.params;

  try {
    //validate input
    if (!ObjectId.isValid(id))
      throw new AppError(400, "Bad request", "Invalid id");

    const UserId = await User.findById(id).populate("task");
    if (!UserId) throw new AppError(404, "Bad Request", "Not Found Employee");
    if (!UserId.task?.length)
      sendResponse(res, 200, true, UserId, null, "Empty task");
    //send res
    sendResponse(res, 200, true, UserId, null, "Get task successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
