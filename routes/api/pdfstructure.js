const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const auth = require("../../middleware/auth");

// @route    GET api/pdfstructure
// @desc     construct pdf object
// @access   private
// @schema  {}

router.post("/", auth, async (req, res) => {
  
  const { item_uuids } = req.body

  try {
    const sql = "SELECT * FROM group_title";
    const query = "SELECT * FROM sub_list";
    let estimates;
    db.execute(sql, (err, results) => {
      if(err) {
        return res.send(JSON.stringify(err))
      }else {
        estimates = results
        db.execute(query, (err, results) => {
          if(err) {
            return res.send(JSON.stringify(err))
          }
          estimates.filter(row => {
            let sub = []
            results.map(data=> {
              if(item_uuids.includes(data.item_uuid) && data.group_uuid === row.group_uuid) {
                sub.push(data)
              }
            })
            row['sub'] = sub
          })
          const result  = estimates.filter(row=> row['sub'].length > 0)
          res.send(result)
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
