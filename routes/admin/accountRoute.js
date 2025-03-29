const express = require("express");
const router = express.Router();
const {
  getAccounts,
  getAccount,
  postCreateAccount,
  patchAccount,
} = require("../../controllers/admin/accountController");

router.get("/accounts", getAccounts);
router.get("/account/:id", getAccount);
router.post("/account/create", postCreateAccount);
router.patch("/account/:id", patchAccount);

module.exports = router;
