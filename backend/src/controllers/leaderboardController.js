import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select("name email points streak")
      .sort({ points: -1 })
      .limit(100);

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      points: user.points || 0,
      streak: user.streak || 0
    }));

    res.json({
      success: true,
      message: "Leaderboard fetched successfully",
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
      error: error.message
    });
  }
};
