const express = require("express");
const router = express.Router();
const config = require("config");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const db = require("../../config/db");

// @route    POST api/auth
// @desc     Authenticate user and get token
// @access   public

router.post(
  "/",
  [
    check("email", "Please inclide valid email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: true }),
    check("password", "Password must be 6 or more characters").isLength({
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
    
    const { email, password } = req.body;

    try {
      // Fetch data to compare email and password
      const query = `SELECT * FROM users WHERE email = ${db.escape(email)};`;
      db.execute(query, async (err, results) => {
        if (results.length === 0) {
          return res.json({
            status: 400,
            message: "Invalid credentials",
          });
        }
        // Check if password is correct
        const isMatched = await bcrypt.compare(password, results[0].password);
        if (!isMatched) {
          return res.json({
            status: 400,
            message: "Invalid credentials",
          });
        }
        const user = results[0];
        const payload = {
          user: {
            id: user.uuid,
          },
        };

        delete user['password']

        // Return jsonwebtoken
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({
              status: 200,
              message: "Authentication successfull",
              token,
              data: user
            });
          }
        );
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }
);

module.exports = router;
