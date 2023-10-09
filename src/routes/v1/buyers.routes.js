const { Router } = require("express");
const { tokenValidate, adminValidate } = require("../../services/auth");
const { listOneBuyer } = require("../../controllers/user.controller");
const { getBuyersOffsetLimit, getBuyersAdresses } = require("../../controllers/buyers.controller")

class BuyersRouter {
  routesFromBuyers() {
    const buyersRoutes = Router();
    buyersRoutes.get("/buyers/admin/:offset/:limit", tokenValidate, adminValidate, getBuyersOffsetLimit);
    buyersRoutes.get("/buyers/admin/:user_id", tokenValidate, adminValidate, listOneBuyer);
    buyersRoutes.patch("/buyers/admin/:user_id");
    buyersRoutes.get("/buyers/address", tokenValidate, getBuyersAdresses);

    return buyersRoutes;
  }
}

module.exports = new BuyersRouter();
