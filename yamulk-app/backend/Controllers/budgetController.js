import Budget from "../Models/budgetModel.js";
import Trip from "../Models/tripsModel.js";

// GET /budget/:tripId
export async function getBudgetByTrip(req, res) {
  try {
    const { tripId } = req.params;
    
    // Make sure trip belongs to user
    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or unauthorized" });
    }

    let budget = await Budget.findOne({ tripId });
    if (!budget) {
      // Create a default budget if none exists
      budget = new Budget({
        tripId,
        userBudget: trip.totalBudget || 0,
      });
      await budget.save();
      
      // Update trip with budget ID
      trip.budgetId = budget._id;
      await trip.save();
    }

    return res.status(200).json(budget);
  } catch (error) {
    console.error("Get budget error:", error);
    return res.status(500).json({ message: "Error fetching budget", error: error.message });
  }
}

// POST /budget/:tripId
// Update budget (or calculate)
export async function updateBudget(req, res) {
  try {
    const { tripId } = req.params;
    const { transport, accommodation, food, other, userBudget } = req.body;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: tripId, userId: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or unauthorized" });
    }

    // Find or create budget
    let budget = await Budget.findOne({ tripId });
    
    if (!budget) {
      budget = new Budget({ tripId, userBudget: userBudget || trip.totalBudget || 0 });
    }

    if (transport !== undefined) budget.transport = transport;
    if (accommodation !== undefined) budget.accommodation = accommodation;
    if (food !== undefined) budget.food = food;
    if (other !== undefined) budget.other = other;
    if (userBudget !== undefined) budget.userBudget = userBudget;

    await budget.save(); // Pre-validate hook will auto-calc totalCost and status

    // Update trip with budget ID if needed
    if (!trip.budgetId) {
      trip.budgetId = budget._id;
      await trip.save();
    }

    return res.status(200).json({
      message: "Budget updated successfully",
      budget
    });

  } catch (error) {
    console.error("Update budget error:", error);
    return res.status(500).json({ message: "Error updating budget", error: error.message });
  }
}
