const express = require("express");
const {
  createUser,
  getAllUser,
  getTaskByUserId,
} = require("../controllers/user.controller");
const router = express.Router();

/**
 * @route GET api/users
 * @description Get a list of users
 * @access private
 */

router.get("/", getAllUser);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */

router.get("/:id", getTaskByUserId);

/**
 * @route POST API/user
 * @description Create new User
 * @access private
 */

router.post("/", createUser);

module.exports = router;
