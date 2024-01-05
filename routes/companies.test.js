const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany1, testCompany2;



beforeEach(async function () {
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM invoices');

  let result = await db.query(
    `INSERT INTO companies (code, name, description)
        VALUES ('apple', 'Apple Computer', 'Maker of OSX.')
        RETURNING code, name, description`
  )
  testCompany1 = result.rows[0];

  result = await db.query(
    `INSERT INTO companies (code, name, description)
        VALUES ('ibm', 'IBM', 'Big blue.')
        RETURNING code, name, description`
  )
  testCompany2 = result.rows[0];
});


describe('GET /companies', function () {

  test('GET /companies', async function () {
    const resp = await request(app).get(`/companies`);
    expect(resp.body).toEqual({
      companies: [
        {'code': testCompany1.code, 'name': testCompany1.name},
        {'code': testCompany2.code, 'name': testCompany2.name},
      ]
    });
  });

});

describe('GET /companies/[code]', function () {

  test('GET /companies/[code]', async function () {
    const resp = await request(app).get(`/companies/${testCompany1.code}`)
    expect(resp.body).toEqual({
      company:
        {
          'code': testCompany1.code,
          'name': testCompany1.name,
          'description': testCompany1.description,
          'invoices': expect.any(Array)
        }
    });
  });

});

describe('POST /companies', function () {

  test('POST /companies', async function () {
    const companyToAdd = {
      code: "test",
      name: "Test Add",
      description: "test added company"
    };

    const resp = await request(app)
        .post(`/companies`)
        .send(companyToAdd);

    expect (resp.body).toEqual({
      company: companyToAdd
    })

  });
});

afterAll(async function () {
  await db.end();
});
