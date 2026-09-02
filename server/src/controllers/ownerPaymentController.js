import pool from "../config/db.js";

export const getOwnerPaymentDetails = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const result = await pool.query(
      `
      SELECT
        id,
        owner_id,
        upi_id,
        payment_instructions,
        created_at,
        updated_at
      FROM owner_payment_details
      WHERE owner_id = $1
      `,
      [ownerId]
    );

    // Owner has not saved payment details yet
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        payment_details: null
      });
    }

    res.json({
      success: true,
      payment_details: result.rows[0]
    });

  } catch (error) {
    console.error("Get owner payment details error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const saveOwnerPaymentDetails = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const {
      upi_id,
      payment_instructions
    } = req.body;

    // UPI ID is optional, but if provided, don't allow an empty value
    if (upi_id !== undefined && upi_id !== null && upi_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "UPI ID cannot be empty"
      });
    }

    // Check whether payment details already exist
    const existingDetails = await pool.query(
      `
      SELECT id
      FROM owner_payment_details
      WHERE owner_id = $1
      `,
      [ownerId]
    );

    let result;

    if (existingDetails.rows.length === 0) {
      // Create payment details
      result = await pool.query(
        `
        INSERT INTO owner_payment_details (
          owner_id,
          upi_id,
          payment_instructions
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          owner_id,
          upi_id,
          payment_instructions,
          created_at,
          updated_at
        `,
        [
          ownerId,
          upi_id ? upi_id.trim() : null,
          payment_instructions || null
        ]
      );
    } else {
      // Update existing payment details
      result = await pool.query(
        `
        UPDATE owner_payment_details
        SET
          upi_id = $1,
          payment_instructions = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE owner_id = $3
        RETURNING
          id,
          owner_id,
          upi_id,
          payment_instructions,
          created_at,
          updated_at
        `,
        [
          upi_id ? upi_id.trim() : null,
          payment_instructions || null,
          ownerId
        ]
      );
    }

    res.json({
      success: true,
      message: "Payment details saved successfully",
      payment_details: result.rows[0]
    });

  } catch (error) {
    console.error("Save owner payment details error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};