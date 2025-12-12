/**
 * User Model
 * 
 * This module defines the User schema and model for the blogging application.
 * It supports both traditional email/password authentication and Google OAuth.
 * 
 * @module models/User
 * @requires sequelize
 */

const { DataTypes, Model } = require('sequelize');
const { getSequelize } = require('../config/db');

/**
 * User Model Class
 * 
 * Defines the structure of user records in PostgreSQL.
 * Supports dual authentication methods: email/password and Google OAuth.
 */
class User extends Model {
  /**
   * Instance method to get public profile
   * Returns user data without sensitive information (password)
   * 
   * @returns {Object} Public user profile
   */
  getPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      dob: this.dob,
      gender: this.gender,
      nickname: this.nickname,
      bio: this.bio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Initialize User Model
 * 
 * Defines the User schema with all fields and validations
 * 
 * @returns {typeof User} User model class
 */
const initUserModel = () => {
  const sequelize = getSequelize();

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Name is required',
          },
          len: {
            args: [2, 100],
            msg: 'Name must be between 2 and 100 characters',
          },
        },
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Date of birth is required',
          },
          isDate: {
            msg: 'Please provide a valid date',
          },
          isOldEnough(value) {
            const thirteenYearsAgo = new Date();
            thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
            const dob = new Date(value);
            
            if (dob >= thirteenYearsAgo) {
              throw new Error('User must be at least 13 years old');
            }
          },
        },
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Gender is required',
          },
          isIn: {
            args: [['male', 'female', 'other']],
            msg: 'Gender must be male, female, or other',
          },
        },
      },
      nickname: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '',
        validate: {
          len: {
            args: [0, 50],
            msg: 'Nickname cannot exceed 50 characters',
          },
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
        validate: {
          len: {
            args: [0, 500],
            msg: 'Bio cannot exceed 500 characters',
          },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          msg: 'Email address already in use',
        },
        validate: {
          notEmpty: {
            msg: 'Email is required',
          },
          isEmail: {
            msg: 'Please provide a valid email address',
          },
        },
        set(value) {
          // Automatically lowercase emails
          this.setDataValue('email', value.toLowerCase().trim());
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          customValidation(value) {
            // Password is required only for non-Google OAuth users
            if (!value && !this.googleId) {
              throw new Error('Password is required for email/password authentication');
            }
          },
        },
      },
      googleId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: false,
      hooks: {
        beforeValidate: (user) => {
          // Trim string fields
          if (user.name) user.name = user.name.trim();
          if (user.nickname) user.nickname = user.nickname.trim();
        },
        beforeCreate: (user) => {
          // Ensure user has at least one authentication method
          if (!user.password && !user.googleId) {
            throw new Error('User must have either password or Google authentication');
          }
        },
        beforeUpdate: (user) => {
          // Ensure user has at least one authentication method
          if (!user.password && !user.googleId) {
            throw new Error('User must have either password or Google authentication');
          }
        },
      },
    }
  );

  return User;
};

module.exports = { User, initUserModel };
