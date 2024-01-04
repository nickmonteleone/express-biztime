"use strict";

/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require('../expressError');
const db = require("../db");

const router = new express.Router();


/** GET / - returns {companies: [{code, name}, ...]} */

router.get("/", async function (req, res) {
  const results = await db.query(
    "SELECT code, name FROM companies"
  );
  const companies = results.rows;

  return res.json({ companies });
});

/** GET /[code] - returns {company: {code, name, description}} */

router.get('/:code', async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];

  if (company === undefined) {
    throw new NotFoundError(`no matching company: ${code}`);
  }

  return res.json({ company });
});

/** POST / -
 * {code, name, description} returns {company: {code, name, description}}*/

router.post("/", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
    [req.body.code, req.body.name, req.body.description]
  );

  const company = results.rows[0];

  return res.json({ company });
});

/** PUT / -
 * {name, description} returns {company: {code, name, description}}*/

router.put('/:code', async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
        SET name = $1, description = $2
        WHERE code = $3
        RETURNING code, name, description`,
    [req.body.name, req.body.description, code]
  );

  const company = results.rows[0];

  if (!company) {
    throw new NotFoundError(`${code} not found`);
  }

  return res.json({ company });
});

/** DELETE / - returns {status: "deleted"}*/

router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `DELETE FROM companies
        WHERE code = $1
        RETURNING code`,
    [code]
  );

  const company = results.rows[0];

  if (!company) {
    throw new NotFoundError(`${code} not found`);
  }

  return res.json({status: "deleted"});
});


module.exports = router;
