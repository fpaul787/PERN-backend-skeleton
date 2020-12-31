"use strict";

const SmartUser = require("../models/SmartUser");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("SmartUsers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        trim: true,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Name is required",
          },
        },
      },
      email: {
        type: Sequelize.STRING,
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
            return User.findOne({ where: { name: value } }).then((name) => {
              if (name) {
                throw new Error("Validation error: name already exist");
              }
            });
          },
        },
      },
      hashed_password: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        get() {
          return () => this.getDataValue("salt");
        },
      },
      updated: {
        type: Sequelize.DATE,
      },
      created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    queryInterface.addIndex("SmartUsers", ["email"], {
      indexName: "email",
      indicesType: "UNIQUE",
    });

    // await queryInterface.bulkInsert("SmartUsers", {
    //   validate: true,
    //   individualHooks: true,
    // });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("SmartUsers");
  },
};
