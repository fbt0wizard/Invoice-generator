const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const db = require("../../config/db");
const auth = require("../../middleware/auth");
const config = require("config");
const moment = require("moment");

// @route    POST api/users
// @desc     Register User
// @access   public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please inclide valid email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: true }),
    check(
      "password",
      "Please enter a password with 6 or more character"
    ).isLength({
      min: 6,
    }),
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

    const { username, name, email, password } = req.body;

    try {
      // See if email exist
      const checkEmailQuery = `SELECT * FROM users WHERE email = ${db.escape(
        email
      )};`;
      db.execute(checkEmailQuery, (err, results, fields) => {
        if (results.length > 0) {
          return res.json({
            status: 400,
            message: "Email already in use",
          });
        }
      });

      // see id username exist
      const checkUsernameQuery = `SELECT * FROM users WHERE username = ${db.escape(
        username
      )};`;
      db.execute(checkUsernameQuery, (err, results, fields) => {
        if (results.length > 0) {
          res.json({
            status: 400,
            message: "Username already in use",
          });
        }
      });

      // Create user info
      const user = {
        uuid: `usr-${uuidv4()}`,
        name: name,
        username: username,
        email: email,
        cr_date: JSON.stringify(moment()),
        role: "ADMIN",
      };

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user["password"] = await bcrypt.hash(password, salt);

      // Save user to db
      const saveQuery = `INSERT INTO users (uuid, name, username, email, password, cr_date, role) VALUES (${db.escape(
        user.uuid
      )}, ${db.escape(user.name)}, ${db.escape(user.username)}, ${db.escape(
        user.email
      )}, ${db.escape(user.password)}, ${db.escape(user.cr_date)}, ${db.escape(
        user.role
      )});`;
      db.execute(saveQuery, (err, results) => {
        if (err !== null) {
          return res.status(500).send(JSON.stringify(err));
        }
      });

      const payload = {
        user: {
          uuid: user.uuid,
        },
      };

      // Return jsonwebtoken

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 30000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            status: 200,
            message: "Account created",
            token,
          });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: error });
    }
  }
);

// @route    GET api/users
// @desc     Get all users
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    const getQuery = "SELECT * FROM users ORDER BY id DESC"
    db.execute(getQuery, (err, results)=> {
      if (err !== null) {
        return res.status(500).send(JSON.stringify(err));
      }
      if(results.length === 0) {
        return res.json({status: 404, msg: "No user found"})
      }
      results.map(result => delete result['password'])
      res.json({
        status: 200,
        count: results.length,
        data: results,
      });
    })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});


// @route    GET api/users/current
// @desc     Get the user with token
// @access   private

router.get('/current', auth, async(req,res)=> {
  try {
    const sql = `SELECT * FROM users WHERE uuid = '${req.user.id}';`
    db.execute(sql, (err, results)=> {
      res.json({...results[0]})
    })
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

// @route    DELETE api/users/:uuid
// @desc     Delete user account
// @access   private

router.delete('/:uuid', auth, async(req,res)=> {
  const { uuid } = req.params

  try {
    const sql = `DELETE FROM users WHERE uuid = '${uuid}';`;
    db.execute(sql, (err, results) => {
      if(err !== null) {
        return res.status(500).send(JSON.stringify(err))
      }
      if(results.affectedRows > 0) {
        res.json({
            status: 200,
            message: "user deleted"
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
})

module.exports = router;
