"use strict";

/** Routes for companies */

const express = require("express");

const router = new express.Router();
const db = require("../db");

/** GET / - returns {companies: [{code, name}, ...]} */

router.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
})


module.exports = router;