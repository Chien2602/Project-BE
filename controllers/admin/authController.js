const Account = require("../../models/accountModel");
const bcrypt = require("bcrypt");

// [POST - Login] /api/v1/admin/login
const postLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email or Password is empty!",
      });
    }
    const account = await Account.findOne({
      email: email,
      deleted: false,
    });
    if (!account) {
      return res.status(400).json({
        message: "Account does not exist!",
      });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "password is wrong!",
      });
    }
    if (account.status === "inactive") {
      return res.status(400).json({
        message: "Account is locked!",
      });
    }
    res.cookie("token", account.token);
    return res.status(200).json({
      message: "Login success!",
      token: account.token,
    });
  } catch (error) {
    return res.status(200).json({
      message: "Login fail!",
      error: error.message,
    });
  }
};

// [GET - Logout] /api/v1/admin/logout
const postLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.status(200).json({
      message: "Logout success!",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Logout fail!",
    });
  }
};

module.exports = {
  postLogin,
  postLogout,
};
