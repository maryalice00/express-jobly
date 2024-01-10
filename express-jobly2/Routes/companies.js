/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const { authenticateJWT } = require("../middleware/authMiddleware"); // Import the new middleware
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

/** 
 * POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login, admin
 */
router.post("/", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - name (case-insensitive, partial match)
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    // Your existing code here...

  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** 
 * PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login, admin
 */
router.patch("/:handle", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login, admin
 */
router.delete("/:handle", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
