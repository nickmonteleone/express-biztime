"use strict";

/** Routes for companies */

const express = require("express");

const router = new express.Router();
const db = require("../db");
const { NotFoundError } = require('../expressError');
/** GET / - returns {companies: [{code, name}, ...]} */

router.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});

router.get('/:code', async function (req, res) {
  const code = req.params.id;
  const results = await db.query(
    'SELECT id, FROM biztime WHERE id = $1', [id]
  );

  const company = results.rows[0];

  if (company === undefined) {
    throw new NotFoundError(`no matching company: ${id}`);
  }

  return (res.json({ company }));
});


module.exports = router;