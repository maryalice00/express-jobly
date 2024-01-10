// models/user.js

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  // ... (existing code)

  /** Apply for a job.
   *
   * This updates `applied_jobs` for the user.
   *
   * Returns { applied: jobId }
   * 
   * Throws NotFoundError if not found.
   * Throws BadRequestError if already applied.
   **/
  static async apply(username, jobId) {
    // ... (existing code)
  }

  /** Associate a user with a technology.
   *
   * Returns undefined.
   *
   * Throws NotFoundError if the user or technology not found.
   * Throws BadRequestError if already associated.
   **/
  static async addTechnology(username, techId) {
    const checkUser = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (!checkUser.rows[0]) {
      throw new NotFoundError(`No user with username: ${username}`);
    }

    const checkTechnology = await db.query(
      `SELECT id
       FROM technologies
       WHERE id = $1`,
      [techId]
    );

    if (!checkTechnology.rows[0]) {
      throw new NotFoundError(`No technology with ID: ${techId}`);
    }

    const checkAssociation = await db.query(
      `SELECT id
       FROM user_technologies
       WHERE user_username = $1 AND tech_id = $2`,
      [username, techId]
    );

    if (checkAssociation.rows[0]) {
      throw new BadRequestError(`User ${username} is already associated with technology ${techId}`);
    }

    await db.query(
      `INSERT INTO user_technologies (user_username, 
