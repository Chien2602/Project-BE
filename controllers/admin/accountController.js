const Account = require("../../models/accountModel");
const Role = require("../../models/roleModel");
const bcrypt = require("bcrypt");
const { generateRandomString } = require("../../utils/generateRandom");

// [GET] /api/v1/admin/accounts
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      deleted: false,
    });

    for (const account of accounts) {
      const role = await Role.findOne({
        _id: account.roleId,
        deleted: false,
      });
      account.role = role.title;
    }
    res.status(200).json(accounts);
  } catch (error) {
    res.status(400).json({
      message: "Error getting list of users!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/account/:id
const getAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });
    if (!account) {
      res.status(400).json({ message: "Account does not exist!" });
    }
    const role = await Role.findOne({
      _id: account.roleId,
      deleted: false,
    });
    account.role = role.title;
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({
      message: "Error getting users!",
      error: error.message,
    });
  }
};

// [POST - Create] /api/v1/admin/account/create
const postCreateAccount = async (req, res) => {
  try {
    if (!req.body.password) {
      res.status(400).json({
        message: "Password is require!",
      });
    }
    const saltRound = parseInt(process.env.SALT_ROUND);
    req.body.password = await bcrypt.hash(req.body.password, saltRound);
    req.body.token = generateRandomString(30);
    const account = new Account(req.body);
    await account.save();
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({
      message: "Error while creating account!",
      error: error.message,
    });
  }
};

// [PATCH - Edit] /api/v1/admin/account/edit/:id
const patchAccount = async (req, res) => {
  try {
    const id = req.params.id;
    const account = await Account.findOne({
      _id: id,
      deleted: false,
    });
    if (!account) {
      res.status(400).json({ message: "Account does not exist!" });
    }
    if (req.body.password && req.body.password.trim() != "") {
      const saltRound = process.env.SALT_ROUND;
      req.body.password = await bcrypt.hash(req.body.password, saltRound);
    } else {
      delete req.body.password;
    }
    await Account.updateOne({ _id: id }, req.body);
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({
      message: "Error updating account!",
      error: error.message,
    });
  }
};

module.exports = { getAccounts, getAccount, postCreateAccount, patchAccount };
