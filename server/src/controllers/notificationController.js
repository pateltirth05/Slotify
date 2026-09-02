import pool from "../config/db.js";

export const createNotification = async ({
  userId,
  bookingId = null,
  type,
  title,
  message
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        booking_id,
        type,
        title,
        message
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        userId,
        bookingId,
        type,
        title,
        message
      ]
    );

    return result.rows[0];

  } catch (error) {
    console.error("Create notification error:", error);

    throw error;
  }
};
// Get logged-in user's notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        id,
        booking_id,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      notifications: result.rows
    });

  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get notifications"
    });
  }
};


// Mark one notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: result.rows[0]
    });

  } catch (error) {
    console.error("Mark notification read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notification"
    });
  }
};


// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1
        AND is_read = FALSE
      RETURNING id
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updated_count: result.rows.length
    });

  } catch (error) {
    console.error("Mark all notifications read error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update notifications"
    });
  }
};