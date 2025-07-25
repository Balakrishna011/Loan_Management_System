const express = require("express");

const router = express.Router();

const customerRoutes = require("./user");
const loanOfficerRoutes = require("./loanofficer")
// const adminRoutes = require("./admin")
// const productRoutes = require("./products")

router.use("/user", customerRoutes);
router.use("/loanofficer", loanOfficerRoutes);
// router.use("/admin", adminRoutes);
// router.use("/product", productRoutes);


module.exports = router;