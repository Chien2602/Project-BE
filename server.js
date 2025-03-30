const express = require("express");
require("dotenv").config();
const connectMongodb = require("./config/connectMongodb");
const accountRoute = require("./routes/admin/accountRoute");
const authRoute = require("./routes/admin/authRoute");
const app = express();
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const port = process.env.PORT || 5000;
connectMongodb();

// API ADMIN
app.use("/api/v1/admin", accountRoute);
app.use("/api/v1/admin", authRoute);

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
