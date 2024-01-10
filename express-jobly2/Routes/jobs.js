"use strict";

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { authenticateJWT } = require("../middleware/authMiddleware");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = express.Router();

/** 
 * POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, admin
 */
router.post("/", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    const jobs = await Job.findAll();
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** 
 * GET /:id  =>  { job }
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** 
 * PATCH /:id { job } => { job }
 *
 * Data can include: { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login, admin
 */
router.patch("/:id", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /:id  =>  { deleted: id }
 *
 * Authorization required: login, admin
 */
router.delete("/:id", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

/** 
 * POST /:id/technologies/:techId  =>  { applied: techId }
 *
 * Authorization required: login, admin
 */
router.post("/:id/technologies/:techId", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    await Job.addTechnology(req.params.id, req.params.techId);
    return res.json({ applied: req.params.techId });
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /:id/technologies/:techId  =>  { removed: techId }
 *
 * Authorization required: login, admin
 */
router.delete("/:id/technologies/:techId", ensureLoggedIn, authenticateJWT, async function (req, res, next) {
  try {
    // Check if req.user.is_admin is true
    if (!req.user.is_admin) {
      throw new BadRequestError("Admin privileges required");
    }

    await Job.removeTechnology(req.params.id, req.params.techId);
    return res.json({ removed: req.params.techId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
