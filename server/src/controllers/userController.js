import pool from "../config/db.js";
import bcrypt from "bcrypt";
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        COUNT(b.id) AS total_bookings
      FROM users u
      LEFT JOIN bookings b
        ON b.customer_id = u.id
      WHERE u.id = $1
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.created_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        member_since: user.created_at,
        total_bookings: Number(user.total_bookings),
        account_status: user.status
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { name, email } = req.body;

    // Make sure at least one field is provided
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "Name or email is required"
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters"
        });
      }
    }

    // Validate email if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }
    }

    // Check whether the new email already belongs to another user
    if (email !== undefined) {
      const existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        AND id != $2
        `,
        [email.trim(), userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use"
        });
      }
    }

    // Update the profile
    const result = await pool.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, role, created_at, updated_at
      `,
      [
        name !== undefined ? name.trim() : null,
        email !== undefined ? email.trim().toLowerCase() : null,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      current_password,
      new_password,
      confirm_password
    } = req.body;

    // Check all fields are provided
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required"
      });
    }

    // Check new password and confirmation match
    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match"
      });
    }

    // Check minimum password length
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters"
      });
    }

    // Get current password hash
    const result = await pool.query(
      `
      SELECT password_hash
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];

    // Compare current password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // Save new password
    await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};