const Account = require("../../models/accountModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateTokens} = require("../../utils/generateToken");

const postRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }
    const account = await Account.findOne({ refreshToken });
    if (!account) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }
    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.id !== account._id.toString()) {
        return res.status(403).json({ message: "Unauthorized! Token expired or invalid." });
      }

      const newAccessToken = jwt.sign({ id: account._id }, process.env.ACCESS_SECRET, {
        expiresIn: "15m",
      });

      return res.status(200).json({
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Refresh token failed!",
      error: error.message,
    });
  }
};

// [POST - Login] /api/v1/admin/login
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email, deleted: false });

    if (!account) return res.status(401).json({ message: "Invalid email or password!" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password!" });

    if (account.status === "inactive") return res.status(403).json({ message: "Account is locked!" });

    const { accessToken, refreshToken } = generateTokens(account);

    account.refreshToken = refreshToken;
    await account.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Login success!", accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Login failed!", error: error.message });
  }
};

// [GET - Logout] /api/v1/admin/logout
const postLogout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "No token found!" });
    }

    await Account.findOneAndUpdate(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logout success!" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed!", error: error.message });
  }
};

module.exports = { postRefreshToken, postLogin, postLogout };
