import pool from "../config/db.js";


// ==========================================
// CREATE AVAILABILITY BLOCK
// ==========================================

export const createAvailabilityBlock = async (req, res) => {
  try {
    const {
      resource_id,
      block_date,
      start_time,
      end_time,
      reason
    } = req.body;

    // ------------------------------------------
    // 1. Basic validation
    // ------------------------------------------

    if (!resource_id || !block_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Resource, date, start time and end time are required"
      });
    }

    // ------------------------------------------
    // 2. Validate date
    // ------------------------------------------

    const dateValue = new Date(`${block_date}T00:00:00`);

    if (Number.isNaN(dateValue.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // ------------------------------------------
    // 3. Do not allow past dates
    // ------------------------------------------

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateValue < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a block for a past date"
      });
    }

    // ------------------------------------------
    // 4. Validate time
    // ------------------------------------------

    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time"
      });
    }

    // ------------------------------------------
    // 5. Check resource and owner
    // ------------------------------------------

    const resourceResult = await pool.query(
      `
      SELECT
        r.id,
        r.ground_id,
        r.name,
        r.opening_time,
        r.closing_time,
        r.status,
        g.owner_id
      FROM resources r
      JOIN grounds g
        ON r.ground_id = g.id
      WHERE r.id = $1
      `,
      [resource_id]
    );

    if (resourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    const resource = resourceResult.rows[0];

    // ------------------------------------------
    // 6. Check ownership
    // ------------------------------------------

    if (resource.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not own this resource"
      });
    }

    // ------------------------------------------
    // 7. Check resource status
    // ------------------------------------------

    if (resource.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This resource is currently inactive"
      });
    }

    // ------------------------------------------
    // 8. Check operating hours
    // ------------------------------------------

    if (
      start_time < resource.opening_time ||
      end_time > resource.closing_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Block must be within the resource operating hours"
      });
    }

    // ------------------------------------------
    // 9. Check whether bookings already exist
    // ------------------------------------------

    const bookingResult = await pool.query(
      `
      SELECT id
      FROM bookings
      WHERE resource_id = $1
        AND booking_date = $2
        AND status IN ('PENDING', 'CONFIRMED')
        AND start_time < $4
        AND end_time > $3
      LIMIT 1
      `,
      [
        resource_id,
        block_date,
        start_time,
        end_time
      ]
    );

    if (bookingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot block this period because a booking already exists"
      });
    }

    // ------------------------------------------
    // 10. Create block
    // ------------------------------------------

    try {
      const result = await pool.query(
        `
        INSERT INTO availability_blocks
        (
          resource_id,
          block_date,
          start_time,
          end_time,
          reason
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          resource_id,
          block_date,
          start_time,
          end_time,
          reason || null
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Availability block created successfully",
        block: result.rows[0]
      });

    } catch (error) {

      // PostgreSQL exclusion constraint violation
      if (error.code === "23P01") {
        return res.status(409).json({
          success: false,
          message: "This resource already has an overlapping block"
        });
      }

      throw error;
    }

  } catch (error) {
    console.error("Create availability block error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};


// ==========================================
// GET BLOCKS FOR A RESOURCE
// ==========================================

export const getResourceBlocks = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM availability_blocks
      WHERE resource_id = $1
      ORDER BY block_date, start_time
      `,
      [resourceId]
    );

    return res.status(200).json({
      success: true,
      blocks: result.rows
    });

  } catch (error) {
    console.error("Get availability blocks error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};


// ==========================================
// DELETE / REMOVE AVAILABILITY BLOCK
// ==========================================

export const deleteAvailabilityBlock = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------------------
    // 1. Find block + verify owner
    // ------------------------------------------

    const blockResult = await pool.query(
      `
      SELECT
        ab.id,
        ab.resource_id,
        ab.block_date,
        ab.start_time,
        ab.end_time,
        ab.reason,
        g.owner_id
      FROM availability_blocks ab
      JOIN resources r
        ON ab.resource_id = r.id
      JOIN grounds g
        ON r.ground_id = g.id
      WHERE ab.id = $1
      `,
      [id]
    );

    if (blockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Availability block not found"
      });
    }

    const block = blockResult.rows[0];

    // ------------------------------------------
    // 2. Ownership check
    // ------------------------------------------

    if (block.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to remove this block"
      });
    }

    // ------------------------------------------
    // 3. Delete block
    // ------------------------------------------

    await pool.query(
      `
      DELETE FROM availability_blocks
      WHERE id = $1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Availability block removed successfully"
    });

  } catch (error) {
    console.error("Delete availability block error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};