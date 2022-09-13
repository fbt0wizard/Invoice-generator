const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../../config/db");
const auth = require("../../middleware/auth");
const moment = require("moment");

// @route    POST api/history
// @desc     Post estimate history
// @access   private
// schema  { "client": Object, "pdfStructure": Array, "estimation": Array, "prices": Array }

router.post("/", auth, async (req, res) => {
  const { client, pdfStructure, estimation, prices, totalPrice } = req.body;

  // Pretare the history
  const history = {
    uuid: `his-${uuidv4()}`,
    date: JSON.stringify(moment()),
    last_update: JSON.stringify(moment()),
    client: JSON.stringify(client),
    totalPrice: totalPrice,
    pdfStructure: JSON.stringify(pdfStructure),
    estimation: JSON.stringify(estimation),
    prices: JSON.stringify(prices),
  };

  try {
    // Save user to db
    const saveQuery = `INSERT INTO history (history_uuid, client, date_created, last_updated, pdf_structure, estimations, prices, total_price) VALUES (${db.escape(
      history.uuid
    )}, ${db.escape(history.client)}, ${history.date}, ${
      history.last_update
    }, ${db.escape(history.pdfStructure)}, ${db.escape(
      history.estimation
    )}, ${db.escape(history.prices)}, ${db.escape(history.totalPrice)});`;
    db.execute(saveQuery, (err, results) => {
      if (err !== null) {
        return res.send(JSON.stringify(err));
      }
      if (results) {
        res.json({
          status: 200,
          message: "Record saved",
          data: history,
        });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error });
  }
});

// @route    GET api/history
// @desc     Get all estimate history
// @access   private

router.get("/", auth, async (req, res) => {
  try {
    const getQuery = "SELECT * FROM history ORDER BY id DESC";
    db.execute(getQuery, (err, results) => {
      if (err !== null) {
        return res.status(500).send(JSON.stringify(err));
      }
      if (results.length === 0) {
        return res.json({ status: 404, msg: "No record found" });
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
  const { uuid } = req.params;
  try {
    const sql = `DELETE FROM history WHERE history_uuid = '${uuid}';`;
    db.execute(sql, (err, results) => {
      if (err !== null) {
        return res.status(500).send(JSON.stringify(err));
      }
      if (results.affectedRows > 0) {
        res.json({
          status: 200,
          message: "client deleted",
        });
      } else {
        res.json({
          status: 400,
          message: "Bad request",
        });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
