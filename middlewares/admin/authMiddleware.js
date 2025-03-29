const Account = require("../../models/accountModel");
const Role = require("../../models/roleModel");

const requireAuth = async (req, res, next) => {
  try {
    if (!req.cookies.token) {
      return res
        .status(401)
        .json({ message: "Unauthorized! No token provided." });
    }

    const account = await Account.findOne({
      token: req.cookies.token,
      deleted: false,
    }).select("fullName email phone avatar role_id");

    if (!account) {
      return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }

    const role = await Role.findById(account.role_id).select(
      "title permissions",
    );
    if (!role) {
      return res.status(403).json({ message: "Forbidden! Role not found." });
    }

    // Gán thông tin vào `res.locals` để dùng trong middleware tiếp theo
    res.locals.account = account;
    res.locals.role = role;

    return next();
  } catch (error) {
    console.error("Error in requireAuth middleware:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = requireAuth;
