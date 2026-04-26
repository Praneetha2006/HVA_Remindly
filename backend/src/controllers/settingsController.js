import User from "../models/User.js";

export const getUserSettings = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Ensure preferences exist with defaults
    if (!user.preferences) {
      user.preferences = {
        theme: "light",
        autoReminders: true,
        smartRevisionReminders: true,
        reminderTime: "09:00"
      };
      await user.save();
    }

    // Ensure all preference fields have defaults
    const preferences = {
      theme: user.preferences?.theme || "light",
      autoReminders: user.preferences?.autoReminders !== false ? true : user.preferences.autoReminders,
      smartRevisionReminders: user.preferences?.smartRevisionReminders !== false ? true : user.preferences.smartRevisionReminders,
      reminderTime: user.preferences?.reminderTime || "09:00"
    };

    res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message
    });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const { theme, autoReminders, smartRevisionReminders, reminderTime } = req.body;

    // Validate inputs
    if (theme && !["light", "dark"].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme. Must be 'light' or 'dark'"
      });
    }

    if (autoReminders !== undefined && typeof autoReminders !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "autoReminders must be a boolean"
      });
    }

    if (smartRevisionReminders !== undefined && typeof smartRevisionReminders !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "smartRevisionReminders must be a boolean"
      });
    }

    if (reminderTime && !/^\d{2}:\d{2}$/.test(reminderTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm"
      });
    }

    // Get current user to preserve existing settings
    let user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {
        theme: "light",
        autoReminders: true,
        smartRevisionReminders: true,
        reminderTime: "09:00"
      };
    }

    // Update only provided settings
    if (theme) user.preferences.theme = theme;
    if (autoReminders !== undefined) user.preferences.autoReminders = autoReminders;
    if (smartRevisionReminders !== undefined) user.preferences.smartRevisionReminders = smartRevisionReminders;
    if (reminderTime) user.preferences.reminderTime = reminderTime;

    // Save updated user
    await user.save();

    const preferences = {
      theme: user.preferences.theme,
      autoReminders: user.preferences.autoReminders,
      smartRevisionReminders: user.preferences.smartRevisionReminders,
      reminderTime: user.preferences.reminderTime
    };

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      preferences
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message
    });
  }
};
