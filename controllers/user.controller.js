// our model
// const User = require("../models/user.model.js");
const SmartUser = require("../models/index").SmartUser;

// method that helps with javascript arrays
const { extend } = require("lodash");

const listUsers = async (req, res) => {
  await SmartUser.findAll({
    attributes: ["name", "email", "updated", "created"],
  })
    .then((users) => {
      return res.json(users);
    })
    .catch((error) => {
      return res.status(400).json({
        error: error.message,
      });
    });
};

const createUser = async (req, res) => {
  await SmartUser.create({
    name: req.body.name,
    email: req.body.email,
    hashed_password: req.body.password,
  })
    .then(() =>
      res.status(201).json({
        message: "Successfully signed up!",
      })
    )
    .catch((error) => {
      return res.status(400).json({
        error: error.message,
      });
    });
};

const userById = async (req, res, next, id) => {
  try {
    let user = await SmartUser.findOne({
      where: {
        id: id
      }
    });
    if (!user)
      return res.status("400").json({
        error: "User not found",
      });
    req.profile = user;
    next();
  } catch (err) {
    return res.status("400").json({
      error: "Could not retrieve user",
    });
  }
};

const userAccountRead = async (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

const userAccountUpdate = async (req, res) => {
  try {
    let user = req.profile;
    user = extend(user, req.body); // from lodash module. Merge changes from body into user
    user.updated = Date.now();

    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({
      error: getErrorMessage(error),
    });
  }
};

// const userAccountDelete = async (req, res) => {
//   try {
//     let user = req.profile;
//     let deletedUser = await SmartUser.destroy({
//       where: {
//         id: user.id
//       }
//     });
//     deletedUser.hashed_password = undefined;
//     deletedUser.salt = undefined;
//     res.json(deletedUser);
//   } catch (err) {
//     return res.status(400).json({
//       error: errorHandler.getErrorMessage(err),
//     });
//   }
// };

// exports
module.exports = {
  listUsers,
  createUser,
  userById,
  userAccountRead,
  userAccountUpdate,
  // userAccountDelete,
};
