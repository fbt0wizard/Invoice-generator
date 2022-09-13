const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const db = require("../../config/db");
const auth = require("../../middleware/auth");
const moment = require("moment");

// @route    POST api/users
// @desc     Add client
// @access   private
// schema  { "firstName": String, "lasnName": String }

router.post(
  "/",
  [
    auth,
    [
      check("firstName", "first name is required").not().isEmpty(),
      check("lastName", "last name is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let err = [];
      errors.array().map((error) => err.push(error.msg));
      return res.json({
        status: 400,
        errors: err,
        err_desc: errors.array(),
      });
    }

    const { firstName, lastName } = req.body;

    try {
      // See if client already exist
      const checkEmailQuery = `SELECT * FROM clients WHERE first_name = ${db.escape(
        firstName
      )} AND last_name = ${db.escape(lastName)};`;
      db.execute(checkEmailQuery, (err, results) => {
        if (results.length > 0) {
          return res.json({
            status: 400,
            message: "Client already exist",
          });
        }
        if (err !== null) {
          return res.status(500).send(JSON.stringify(err));
        }
        if (results.length === 0) {
          // Create client data
          const client = {
            uuid: `cli-${uuidv4()}`,
            firstName: firstName,
            lastName: lastName,
            date: JSON.stringify(moment()),
          };

          //   // Save user to db
          const saveQuery = `INSERT INTO clients (client_uuid, first_name, last_name, date) VALUES (${db.escape(
            client.uuid
          )}, ${db.escape(client.firstName)}, ${db.escape(
            client.lastName
          )}, ${db.escape(client.date)});`;
          db.execute(saveQuery, (err, results) => {
            if (err !== null) {
              return res.send(JSON.stringify(err));
            }
            res.json({
              status: 200,
              message: "Client addedd",
            });
          });
        }
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: error });
    }
  }
);

// @route    GET api/client
// @desc     Get all clients
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    const getQuery = "SELECT * FROM clients ORDER BY id DESC";
    db.execute(getQuery, (err, results) => {
      if (err !== null) {
        return res.status(500).send(JSON.stringify(err));
      }
      if (results.length === 0) {
        return res.json({ status: 404, msg: "No client found" });
      }
      if (results.length > 0) {
        res.json({
          status: 200,
          count: results.length,
          data: results,
        });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// @route    DELETE api/clients/:uuid
// @desc     Delete client
// @access   private

router.delete("/:uuid", auth, async (req, res) => {
    const { uuid } = req.params
  try {
    const sql = `DELETE FROM clients WHERE client_uuid = '${uuid}';`;
    db.execute(sql, (err, results) => {
      if(err !== null) {
        return res.status(500).send(JSON.stringify(err))
      }
      if(results.affectedRows > 0) {
        res.json({
            status: 200,
            message: "client deleted"
        })
      }else {
        res.json({
            status: 400,
            message: "Bad request"
        })
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
