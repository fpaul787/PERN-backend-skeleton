const User = require("../models/User");
const SmartUser = require("../models/index").SmartUser;
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("../config/config");

const signin = async (req, res) => {
  try {
    let user = await SmartUser.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user)
      return res.status("401").json({
        error: "Account information was incorrectly entered",
      });

    if (!user.authenticate(req.body.password)) {
      return res.status("401").send({
        error: "Email and password don't match.",
      });
    }

    const token = jwt.sign(
      {
        _id: user.id,
      },
      config.jwtSecret
    );

    res.cookie("t", token, {
      expire: new Date() + 9999,
    });

    return res.json({
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status("401").json({
      error: "Could not sign in",
    });
  }
};

const signout = (req, res) => {
  res.clearCookie("t");
  return res.status("200").json({
    message: "signed out",
  });
};

function requireSignin() {
  return [
    expressJwt({
      secret: config.jwtSecret,
      userProperty: "auth",
      algorithms: ["HS256"],
    }),
    function (err, req, res, next) {
      res.status(err.status).json(err);
    },
  ];
}
// const requireSignin = expressJwt({
//   secret: config.jwtSecret,
//   userProperty: "auth",
//   algorithms: ["HS256"],
// });

const hasAuthorization = (req, res, next) => {
  const authorized =
    req.profile && req.auth && req.profile.dataValues.id === req.auth._id;

  if (!authorized) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};

module.exports = {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
};
