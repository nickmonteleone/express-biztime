const request = require('supertest');
const app = require('../app');
const db = require('..db');


beforeEach(async function () {
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM invoices');

  await db.query(`
    INSERT INTO companies
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
        ('ibm', 'IBM', 'Big blue.');

        INSERT INTO invoices (comp_code, amt, paid, paid_date)
        VALUES ('apple', 100, FALSE, NULL),
          ('apple', 200, FALSE, NULL),
          ('apple', 300, TRUE, '2018-01-01'),
          ('ibm', 400, FALSE, NULL);
    `);
});


describe('', function () {

  test('', function () {

  });
});