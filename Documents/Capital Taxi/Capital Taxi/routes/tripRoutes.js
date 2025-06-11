const express = require("express");
const tripController = require("../controllers/tripController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/calculate-fare", protect, tripController.calculateFare);
router.post("/create", protect, tripController.createTrip);
router.put("/assign-driver", protect, tripController.assignDriver);
router.put("/update-status", protect, tripController.updateTripStatus);
router.get("/user-trips", protect, tripController.getUserTrips);
router.get("/driver-trips", protect, tripController.getDriverTrips);
router.get("/get-directions", protect, tripController.getTripDirections);
router.delete("/:id", protect, tripController.deleteTrip);
router.get("/active-trips", tripController.getActiveTrips); 
router.get("/:id", tripController.getTripById); 
router.post("/webhook/fawaterak", tripController.handleFawaterakWebhook);
module.exports = router;
