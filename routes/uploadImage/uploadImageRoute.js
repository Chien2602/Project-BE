const express = require("express");
const router = express.Router();
const uploadCloud = require("../../controllers/uploadCloudinary/uploadCloudinaryController")

router.post("/uploadImage", uploadCloud);

module.exports = router;