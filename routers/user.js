const express = require("express");
const router = express.Router();

const userController = require("../controller/user");

router.post("/signup", userController.saveUser);
router.post("/login", userController.login);
router.patch("/update", userController.protected, userController.updateUser);
router.get("/:userId", userController.getOneUser);
router.get("/", userController.getUsers);

module.exports = router;
