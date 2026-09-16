import mongoose from "mongoose";
import dotenv from "dotenv";
import Trip from "./Models/tripsModel.js";
import Budget from "./Models/budgetModel.js";

dotenv.config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGOOSEURI);
    console.log("Connected to DB");

    const user_id = new mongoose.Types.ObjectId();
    const dest_id = new mongoose.Types.ObjectId();

    const trip = new Trip({
      userId: user_id,
      destinationId: dest_id,
      travelDate: new Date(),
      returnDate: new Date(Date.now() + 86400000),
      people: 2,
      transportMode: "Car",
      accommodationType: "Hotel",
      totalBudget: 20000,
    });
    await trip.save();
    console.log("Trip saved:", trip._id);

    const tripId = trip._id;
    let budget = new Budget({ tripId, userBudget: 20000 });
    
    budget.transport = 4000;
    budget.accommodation = 6000;
    budget.food = 2800;
    budget.other = 4500;
    budget.userBudget = 20000;

    await budget.save();
    console.log("Budget saved:", budget._id);

    // Now let's try updating it like the controller does
    const fetchedTrip = await Trip.findOne({ _id: tripId, userId: user_id });
    console.log("Fetched trip", fetchedTrip._id);
    
    fetchedTrip.budgetId = budget._id;
    await fetchedTrip.save();
    console.log("Trip updated with budget");
    
    // Test the pre-validate hook explicitly
    console.log("Budget cost calculated:", budget.totalCost);

  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e.message, e.stack);
  }
  process.exit(0);
}
test();
