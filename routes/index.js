var express = require('express');
var router = express.Router();
const item_controller = require("../controllers/itemController");
const category_controller = require("../controllers/categoryController")

// GET home page.
router.get("/", function (req, res) {
  res.redirect("/catalog");
});

module.exports = router;
