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

/** POST /-
 * {comp_code, amt}
 * returns {invoice:
 * {id, comp_code, amt, paid, add_date, paid_date,} */

router.post('/', async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError("Invalid Request");
  }

  const comp_code = req.body.comp_code;

  const compResults = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [comp_code]
  );

  if (!compResults) {
    throw new NotFoundError(`${comp_code} not found`);
  }

  const results = await db.query(`
    INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, req.body.amt]
  );

  const invoice = results.rows[0];

  return res.json({ invoice });
});

/** PUT / -
 * {amt} returns {company: {code, name, description}}
 * returns {invoice:
 * {id, comp_code, amt, paid, add_date, paid_date,} */

router.put('/:id', async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  const id = req.params.id;
  const results = await db.query(
    `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [req.body.amt, id]
  );

  const invoice = results.rows[0];

  if (!invoice) {
    throw new NotFoundError(`Invoice id ${id} not found`);
  }

  return res.json({ invoice });
});

/** DELETE / - returns {status: "deleted"}*/

router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  const results = await db.query(
    `DELETE FROM invoices
        WHERE id = $1
        RETURNING id`,
    [id]
  );

  const invoice = results.rows[0];

  if (!invoice) {
    throw new NotFoundError(`Invoice id ${id} not found`);
  }

  return res.json({status: "deleted"});
});



module.exports = router;
