const jwt = require("jsonwebtoken");
const Account = require("../../models/accountModel");
const Role = require("../../models/roleModel");

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized! No token provided." });
    }

    jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized! Invalid token." });
      }

      const account = await Account.findById(decoded.id).select("fullName email phone avatar role_id");
      if (!account) {
        return res.status(401).json({ message: "Unauthorized! Account not found." });
      }

      const role = await Role.findById(account.role_id).select("title permissions");
      if (!role) {
        return res.status(403).json({ message: "Forbidden! Role not found." });
      }
      res.locals.account = account;
      res.locals.role = role;

      return next();
    });
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = requireAuth;
