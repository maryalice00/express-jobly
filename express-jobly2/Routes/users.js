// routes/users.js

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { authenticateJWT } = require("../middleware/authMiddleware");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const generatePassword = require("generate-password"); // Import the library for generating passwords
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** 
 * POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login, admin
 **/
router.post("/", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // Generate a random password if not provided
    const password = req.body.password || generatePassword.generate({ length: 12, numbers: true, symbols: true, uppercase: true, strict: true });

    const user = await User.register({ ...req.body, password });
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

// ... (other routes)

module.exports = router;
