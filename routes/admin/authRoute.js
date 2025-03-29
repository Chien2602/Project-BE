const express = require("express");
const router = express.Router();
const {
  postLogin,
  postLogout,
} = require("../../controllers/admin/authController");

router.post("/login", postLogin);
router.get("/logout", postLogout);

module.exports = router;
