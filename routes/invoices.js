"use strict";

/** Routes for invoices */

const express = require("express");
const { NotFoundError, BadRequestError } = require('../expressError');
const db = require("../db");

const router = new express.Router();


/** GET / - returns {invoices: [{id, comp_code}, ...]} */

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
        FROM invoices`
  );
  const invoices = results.rows;

  return res.json({ invoices });
});

/** GET /[id] - returns
 * {invoice:
 * {id, amt, paid, add_date, paid_date, company: {code, name, description}} */

router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const invResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
        FROM invoices
        WHERE id = $1`,
    [id]
  );
  const invoice = invResults.rows[0];

  if (!invoice) {
    throw new NotFoundError(`${id} not found`);
  }

  const compResults = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [invoice.comp_code]
  );
  const company = compResults.rows[0];

  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});


module.exports = router;
