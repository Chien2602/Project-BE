const generateTokens = (account) => {
    const accessToken = jwt.sign({ id: account._id, role: account.role }, process.env.SECRET_KEY, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: account._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
  
    return { accessToken, refreshToken };
};
module.exports = {generateTokens};