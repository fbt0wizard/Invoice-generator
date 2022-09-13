const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const auth = require("../../middleware/auth");


// @route    POST api/estimates
// @desc     Get all group and items for estimate
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    const sql = "SELECT * FROM group_title";
    const query = "SELECT * FROM sub_list";
    let estimates;
    db.execute(sql, (err, results) => {
      if(err) {
        return res.send(JSON.stringify(err))
      }else {
        results.map(row => row['isExpanded'] = false)
        estimates = results
        db.execute(query, (err, results) => {
          if(err) {
            return res.send(JSON.stringify(err))
          }
          results.map(data=> data['selected'] = false)
          estimates.filter(row => {
            const sub = results.filter(data=> data.group_uuid === row.group_uuid)
            row['sub'] = sub
          })
          res.send(estimates)
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/update/:uuid", async (req, res) => {
    const { uuid } = req.params
  try {
    const sql = `SELECT * FROM sub_list WHERE group_uuid = ${db.escape(uuid)}`;
    db.execute(sql, (err, results) => {
        res.send(results)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
