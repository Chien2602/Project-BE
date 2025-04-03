const mongoose = require("mongoose");

const connectMongodb = async () => {
  try {
    await mongoose.connect(process.env.URL_CONNECT_MONGODB);
    console.log("connect database success!");
  } catch (error) {
    console.log("connect database fails!", error);
  }
};

module.exports = connectMongodb;
