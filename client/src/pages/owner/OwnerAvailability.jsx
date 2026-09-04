import { useEffect, useState } from "react";
import api from "../../services/api";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"

const OwnerAvailability = () => {
  const [grounds, setGrounds] = useState([]);
  const [resources, setResources] = useState([]);

  const [selectedGround, setSelectedGround] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [availability, setAvailability] = useState(null);

  const [loadingGrounds, setLoadingGrounds] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [showBlockTimeModal, setShowBlockTimeModal] =
    useState(false);

  const [showBlockDateModal, setShowBlockDateModal] =
    useState(false);

  const [blockTimeForm, setBlockTimeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "13:00",
    endTime: "14:00",
    reason: "",
  });

  const [blockDateForm, setBlockDateForm] = useState({
    date: "",
    reason: "",
  });

  // --------------------------------------------------
  // LOAD GROUNDS
  // --------------------------------------------------

  useEffect(() => {
    loadGrounds();
  }, []);

  const loadGrounds = async () => {
    try {
      setLoadingGrounds(true);

      const response = await api.get("/owner/grounds");

      const data = response.data?.grounds || [];

      setGrounds(data);

      if (data.length > 0) {
        setSelectedGround(String(data[0].id));
      }
    } catch (error) {
      console.error("Failed to load grounds:", error);
    } finally {
      setLoadingGrounds(false);
    }
  };

  // --------------------------------------------------
  // LOAD RESOURCES
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedGround) {
      setResources([]);
      setSelectedResource("");
      return;
    }

    loadResources();
  }, [selectedGround]);

  const loadResources = async () => {
    try {
      setLoadingResources(true);

      const response = await api.get(
        `/resources/ground/${selectedGround}`
      );

      const data = response.data?.resources || [];

      setResources(data);

      if (data.length > 0) {
        setSelectedResource(String(data[0].id));
      } else {
        setSelectedResource("");
      }
    } catch (error) {
      console.error("Failed to load resources:", error);

      setResources([]);
      setSelectedResource("");
    } finally {
      setLoadingResources(false);
    }
  };

  // --------------------------------------------------
  // LOAD AVAILABILITY
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedResource || !selectedDate) {
      setAvailability(null);
      return;
    }

    loadAvailability();
  }, [selectedResource, selectedDate]);

  const loadAvailability = async () => {
    try {
      setLoadingAvailability(true);

      const response = await api.get(
        `/availability/${selectedResource}?date=${selectedDate}`
      );

      console.log(
        "OWNER AVAILABILITY RESPONSE:",
        response.data
      );

      setAvailability(response.data);
    } catch (error) {
      console.error(
        "Failed to load availability:",
        error
      );

      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // --------------------------------------------------
  // TIME HELPERS
  // --------------------------------------------------

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}`;
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const period = hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 === 0 ? 12 : hours % 12;

    return `${String(displayHour).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // --------------------------------------------------
  // OPERATING HOURS
  // --------------------------------------------------

  const getOpeningTime = () => {
    return (
      availability?.resource?.opening_time ||
      availability?.operating_hours?.opening_time ||
      availability?.operatingHours?.opening_time ||
      null
    );
  };

  const getClosingTime = () => {
    return (
      availability?.resource?.closing_time ||
      availability?.operating_hours?.closing_time ||
      availability?.operatingHours?.closing_time ||
      null
    );
  };

  // --------------------------------------------------
  // CREATE HOURLY TIMELINE
  // --------------------------------------------------

  const createTimeline = () => {
    const openingTime = getOpeningTime();
    const closingTime = getClosingTime();

    if (!openingTime || !closingTime) {
      return [];
    }

    const openingMinutes =
      timeToMinutes(openingTime);

    const closingMinutes =
      timeToMinutes(closingTime);

    const slots = [];

    let current = openingMinutes;

    while (current < closingMinutes) {
      const next = Math.min(
        current + 60,
        closingMinutes
      );

      slots.push({
        start: minutesToTime(current),
        end: minutesToTime(next),
      });

      current = next;
    }

    return slots;
  };

  // --------------------------------------------------
  // CHECK IF SLOT IS BOOKED
  // --------------------------------------------------

  const isBooked = (slotStart, slotEnd) => {
    const bookedSlots =
      availability?.booked_slots || [];

    const start = timeToMinutes(slotStart);
    const end = timeToMinutes(slotEnd);

    return bookedSlots.some((booking) => {
      const bookingStart = timeToMinutes(
        booking.start_time
      );

      const bookingEnd = timeToMinutes(
        booking.end_time
      );

      return (
        start < bookingEnd &&
        end > bookingStart
      );
    });
  };

  // --------------------------------------------------
  // CHECK IF SLOT IS BLOCKED
  // --------------------------------------------------

  const isBlocked = (slotStart, slotEnd) => {
    const blockedSlots =
      availability?.blocked_slots || [];

    const start = timeToMinutes(slotStart);
    const end = timeToMinutes(slotEnd);

    return blockedSlots.some((block) => {
      const blockStart = timeToMinutes(
        block.start_time
      );

      const blockEnd = timeToMinutes(
        block.end_time
      );

      return (
        start < blockEnd &&
        end > blockStart
      );
    });
  };

  // --------------------------------------------------
  // GET SLOT STATUS
  // --------------------------------------------------

  const getSlotStatus = (slot) => {
    if (isBooked(slot.start, slot.end)) {
      return "booked";
    }

    if (isBlocked(slot.start, slot.end)) {
      return "blocked";
    }

    return "available";
  };

  // --------------------------------------------------
  // BLOCK TIME FORM
  // --------------------------------------------------

  const handleBlockTimeChange = (event) => {
    const { name, value } = event.target;

    setBlockTimeForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CREATE TIME BLOCK
  // --------------------------------------------------

  const handleBlockTimeSubmit = async (event) => {
    event.preventDefault();

    if (!selectedResource) {
      alert("Please select a resource.");
      return;
    }

    if (
      timeToMinutes(blockTimeForm.startTime) >=
      timeToMinutes(blockTimeForm.endTime)
    ) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await api.post("/availability-blocks", {
        resource_id: Number(selectedResource),
        block_date: blockTimeForm.date,
        start_time: blockTimeForm.startTime,
        end_time: blockTimeForm.endTime,
        reason:
          blockTimeForm.reason.trim() ||
          "Unavailable",
      });

      setShowBlockTimeModal(false);

      setSelectedDate(blockTimeForm.date);

      setBlockTimeForm({
        date: blockTimeForm.date,
        startTime: "13:00",
        endTime: "14:00",
        reason: "",
      });

      await loadAvailability();
    } catch (error) {
      console.error(
        "Failed to create time block:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to block this time."
      );
    }
  };

  // --------------------------------------------------
  // BLOCK DATE
  // --------------------------------------------------

  const handleBlockDateChange = (event) => {
    const { name, value } = event.target;

    setBlockDateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleBlockDateSubmit = async (event) => {
    event.preventDefault();

    if (!selectedResource) {
      alert("Please select a resource.");
      return;
    }

    try {
      const openingTime = getOpeningTime();
      const closingTime = getClosingTime();

      if (!openingTime || !closingTime) {
        alert(
          "Operating hours are not available for this resource."
        );
        return;
      }

      await api.post("/availability-blocks", {
        resource_id: Number(selectedResource),
        block_date: blockDateForm.date,
        start_time: openingTime,
        end_time: closingTime,
        reason:
          blockDateForm.reason.trim() ||
          "Private Event",
      });

      setShowBlockDateModal(false);

      setSelectedDate(blockDateForm.date);

      setBlockDateForm({
        date: "",
        reason: "",
      });

      await loadAvailability();
    } catch (error) {
      console.error(
        "Failed to block date:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to block this date."
      );
    }
  };

  // --------------------------------------------------
  // DELETE BLOCK
  // --------------------------------------------------

  const handleDeleteBlock = async (blockId) => {
    const confirmed = window.confirm(
      "Remove this blocked period?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/availability-blocks/${blockId}`
      );

      await loadAvailability();
    } catch (error) {
      console.error(
        "Failed to delete block:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to remove block."
      );
    }
  };

  // --------------------------------------------------
  // DATA
  // --------------------------------------------------

  const timeline = createTimeline();

  const selectedGroundData = grounds.find(
    (ground) =>
      String(ground.id) === String(selectedGround)
  );

  const selectedResourceData = resources.find(
    (resource) =>
      String(resource.id) ===
      String(selectedResource)
  );

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">

        {/* TOP BAR */}

        <div className="admin-topbar">

          <button
            className="hamburger-btn"
            type="button"
          >
            ☰
          </button>

          <h2>Availability</h2>

          <div className="topbar-right">

            <button
              className="btn btn--outline btn--sm"
              type="button"
              onClick={() => {
                setBlockDateForm({
                  date: selectedDate,
                  reason: "",
                });

                setShowBlockDateModal(true);
              }}
            >
              + Block Date
            </button>

            <button
              className="btn btn--primary btn--sm"
              type="button"
              onClick={() => {
                setBlockTimeForm({
                  date: selectedDate,
                  startTime: "13:00",
                  endTime: "14:00",
                  reason: "",
                });

                setShowBlockTimeModal(true);
              }}
            >
              + Block Time
            </button>

          </div>
        </div>

        {/* BODY */}

        <div className="admin-body">

          {/* CONTROLS */}

          <div className="avail-controls">

            <div className="field">
              <label>Select Ground</label>

              <select
                value={selectedGround}
                onChange={(event) =>
                  setSelectedGround(
                    event.target.value
                  )
                }
                disabled={loadingGrounds}
              >
                <option value="">
                  Select Ground
                </option>

                {grounds.map((ground) => (
                  <option
                    key={ground.id}
                    value={ground.id}
                  >
                    {ground.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Select Resource</label>

              <select
                value={selectedResource}
                onChange={(event) =>
                  setSelectedResource(
                    event.target.value
                  )
                }
                disabled={
                  loadingResources ||
                  resources.length === 0
                }
              >
                <option value="">
                  Select Resource
                </option>

                {resources.map((resource) => (
                  <option
                    key={resource.id}
                    value={resource.id}
                  >
                    {resource.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Select Date</label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />
            </div>

          </div>

          {/* OPERATING HOURS */}

          {availability && (
            <div className="avail-hours-banner">

              <span>
                Operating Hours:{" "}
                {formatTime(getOpeningTime())} –{" "}
                {formatTime(getClosingTime())}
              </span>

              <span>
                {selectedResourceData?.name ||
                  availability.resource?.name}{" "}
                ·{" "}
                {selectedGroundData?.name ||
                  ""}
              </span>

            </div>
          )}

          {/* LEGEND */}

          <div className="avail-legend">

            <div className="avail-legend__item">
              <span className="avail-legend__dot avail-legend__dot--available"></span>
              Available
            </div>

            <div className="avail-legend__item">
              <span className="avail-legend__dot avail-legend__dot--booked"></span>
              Booked
            </div>

            <div className="avail-legend__item">
              <span className="avail-legend__dot avail-legend__dot--blocked"></span>
              Blocked
            </div>

          </div>

          {/* LOADING */}

          {loadingAvailability && (
            <div className="admin-empty-state">
              Loading availability...
            </div>
          )}

          {/* TIMELINE */}

          {!loadingAvailability &&
            availability &&
            timeline.length > 0 && (

              <div className="avail-timeline">

                {timeline.map((slot) => {

                  const status =
                    getSlotStatus(slot);

                  return (
                    <div
                      key={`${slot.start}-${slot.end}`}
                      className={`avail-slot avail-slot--${status}`}
                    >

                      <div className="avail-slot__time">
                        {formatTime(slot.start)}
                      </div>

                      <div className="avail-slot__status">
                        {status === "available" &&
                          "Available"}

                        {status === "booked" &&
                          "Booked"}

                        {status === "blocked" &&
                          "Blocked"}
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          {/* NO AVAILABILITY */}

          {!loadingAvailability &&
            selectedResource &&
            !availability && (
              <div className="admin-empty-state">
                No availability data found.
              </div>
            )}

          {/* BLOCKED PERIODS */}

          {!loadingAvailability &&
            availability?.blocked_slots?.length >
              0 && (

              <div className="availability-blocks-list">

                <h3>Blocked Periods</h3>

                {availability.blocked_slots.map(
                  (block) => (

                    <div
                      className="availability-block-item"
                      key={block.block_id}
                    >

                      <div>
                        <strong>
                          {formatTime(
                            block.start_time
                          )}{" "}
                          –{" "}
                          {formatTime(
                            block.end_time
                          )}
                        </strong>

                        <span>
                          {block.reason ||
                            "Unavailable"}
                        </span>
                      </div>

                      <button
                        className="btn btn--outline btn--sm"
                        type="button"
                        onClick={() =>
                          handleDeleteBlock(
                            block.block_id
                          )
                        }
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

        </div>
      </main>

      {/* ------------------------------------------------ */}
      {/* BLOCK TIME MODAL */}
      {/* ------------------------------------------------ */}

      {showBlockTimeModal && (

        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-card__head">

              <h3>Block Time</h3>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setShowBlockTimeModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleBlockTimeSubmit}
            >

              <div className="field">

                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={
                    blockTimeForm.date
                  }
                  onChange={
                    handleBlockTimeChange
                  }
                  required
                />

              </div>

              <div className="field--row">

                <div className="field">

                  <label>Start Time</label>

                  <input
                    type="time"
                    name="startTime"
                    value={
                      blockTimeForm.startTime
                    }
                    onChange={
                      handleBlockTimeChange
                    }
                    required
                  />

                </div>

                <div className="field">

                  <label>End Time</label>

                  <input
                    type="time"
                    name="endTime"
                    value={
                      blockTimeForm.endTime
                    }
                    onChange={
                      handleBlockTimeChange
                    }
                    required
                  />

                </div>

              </div>

              <div className="field">

                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={
                    blockTimeForm.reason
                  }
                  onChange={
                    handleBlockTimeChange
                  }
                  placeholder="e.g. Maintenance"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    setShowBlockTimeModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  Block Time
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* BLOCK DATE MODAL */}
      {/* ------------------------------------------------ */}

      {showBlockDateModal && (

        <div className="modal-backdrop">

          <div className="modal-card">

            <div className="modal-card__head">

              <h3>Block Date</h3>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setShowBlockDateModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleBlockDateSubmit}
            >

              <div className="field">

                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={
                    blockDateForm.date
                  }
                  onChange={
                    handleBlockDateChange
                  }
                  required
                />

              </div>

              <div className="field">

                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={
                    blockDateForm.reason
                  }
                  onChange={
                    handleBlockDateChange
                  }
                  placeholder="e.g. Private Event"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    setShowBlockDateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  Block Date
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default OwnerAvailability;