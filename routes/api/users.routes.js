// imports
const express = require("express");
const router = express.Router();
// our model
const User = require("../../models/User");

const models = require("../../models/index");

// method that helps with javascript arrays
const { extend } = require("lodash");
// utility that helps with error handling
const getErrorMessage = require("../../helpers/dbErrorHandler");
// controller for auth sign in
const {
  requireSignin,
  hasAuthorization,
} = require("../../controllers/auth.controller");

// controller for user
const {
  listUsers,
  createUser,
  userById,
  userAccountRead,
  userAccountUpdate,
} = require("../../controllers/user.controller");


// @route GET api/users
// @desc  Get users
// @access Public
router.get("/", listUsers);

// @route POST api/users
// @desc  Create a user
// @access Public
router.post("/", createUser);

// @route PARAM userId
// @desc  Called when param is passed
// @access Public
router.param("userId", userById);

// @route GET /api/users/:userId
// @desc  Get a user profile
// @access Private, requires sign in
router.get("/:userId", ...requireSignin(), userAccountRead);

// @route PUT /api/users/:userId
// @desc  Update a user profile
// @access Private, requires sign in and authorization
router.put("/:userId", ...requireSignin(), hasAuthorization, userAccountUpdate);

// @route DELETE /api/users/:userId
// @desc  Delete a user profile
// @access Private, requires sign in and authorization
router.delete(
  "/:userId",
  ...requireSignin(),
  hasAuthorization,
  async (req, res) => {
    try {
      let user = req.profile;
      let deletedUser = await user.remove();
      deletedUser.hashed_password = undefined;
      deletedUser.salt = undefined;
      res.json(deletedUser);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  }
);
module.exports = router;
