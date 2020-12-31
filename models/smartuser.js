"use strict";
const { Model } = require("sequelize");
const crypto = require("crypto");
module.exports = (sequelize, DataTypes) => {
  class SmartUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SmartUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        trim: true,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Name is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        trim: true,
        allowNull: false,
        isEmail: true,
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
        validate: {
          isEmail: {
            msg: "Email address invalid",
          },
          notNull: {
            msg: "Email is required",
          },
          isUnique(value) {
            return SmartUser.findOne({ where: { email: value } }).then(
              (name) => {
                if (name) {
                  throw new Error("Validation error: email already exist");
                }
              }
            );
          },
        },
      },
      hashed_password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [5],
            msg: "Please must be at least 5 characters",
          },
          notNull: {
            msg: "Password is required",
          },
        },
        get() {
          return () => this.getDataValue("hashed_password");
        },
      },
      salt: {
        type: DataTypes.STRING,
        get() {
          return () => this.getDataValue("salt");
        },
      },
      updated: {
        type: DataTypes.DATE,
      },
      created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SmartUser",
      timestamps: false,
    }
  );
  SmartUser.addHook("beforeCreate", (user) => {
    user.salt = SmartUser.makeSalt();
    user.hashed_password = SmartUser.encryptPassword(
      user.hashed_password(),
      user.salt()
    );
  });

  SmartUser.addHook("beforeBulkUpdate", async (instance) => {
    if (instance.attributes.password) {
      instance.attributes.salt = SmartUser.makeSalt();
      instance.attributes.hashed_password = SmartUser.encryptPassword(
        user.hashed_password(),
        user.salt()
      );
    }
  });

  SmartUser.makeSalt = function () {
    return crypto.randomBytes(16).toString("base64");
  };

  SmartUser.prototype.authenticate = function (plainText) {
    return (
      SmartUser.encryptPassword(plainText, this.salt()) ===
      this.hashed_password()
    );
  };

  SmartUser.encryptPassword = function (password, salt) {
    if (!password) return "";
    try {
      // return crypto.createHmac("sha256", salt).update(password).digest("hex");
      return crypto
        .createHash("RSA-SHA256")
        .update(password)
        .update(salt)
        .digest("hex");
    } catch (err) {
      console.log("There was an error in encrypting password " + err.message);
      return "";
    }
  };
  return SmartUser;
};
