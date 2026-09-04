import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerAvailability() {
  const [searchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];

  const [grounds, setGrounds] = useState([]);
  const [resources, setResources] = useState([]);

  const [selectedGround, setSelectedGround] = useState(
    searchParams.get("groundId") || ""
  );

  const [selectedResource, setSelectedResource] = useState(
    searchParams.get("resourceId") || ""
  );

  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || today
  );

  const [availability, setAvailability] = useState(null);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [blockType, setBlockType] = useState("TIME");

  const [blockForm, setBlockForm] = useState({
    date: searchParams.get("date") || today,
    start_time: "13:00",
    end_time: "14:00",
    reason: "",
  });

  // ==========================================
  // GET OWNER GROUNDS
  // ==========================================

useEffect(() => {
  const fetchGrounds = async () => {
    try {
      const response = await api.get("/owner/grounds");

      const groundList = response.data.grounds || [];

      setGrounds(groundList);

      // If URL does not provide a ground,
      // automatically select the first ground.
      if (!selectedGround && groundList.length > 0) {
        setSelectedGround(String(groundList[0].id));
      }
    } catch (error) {
      console.error("Get owner grounds error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load grounds"
      );
    }
  };

  fetchGrounds();
}, []);

  // ==========================================
  // GET RESOURCES FOR SELECTED GROUND
  // ==========================================

  useEffect(() => {
    const fetchResources = async () => {
      if (!selectedGround) {
        setResources([]);
        setSelectedResource("");
        return;
      }

      try {
        const response = await api.get(
          `/resources/ground/${selectedGround}`
        );

        const resourceList = response.data.resources || [];

        setResources(resourceList);

        const resourceFromUrl =
          searchParams.get("resourceId");

        const resourceExists = resourceList.some(
          (resource) =>
            String(resource.id) ===
            String(resourceFromUrl)
        );

        if (resourceFromUrl && resourceExists) {
          setSelectedResource(resourceFromUrl);
        } else if (resourceList.length > 0) {
          setSelectedResource(String(resourceList[0].id));
        } else {
          setSelectedResource("");
        }
      } catch (error) {
        console.error("Get resources error:", error);

        setResources([]);
        setSelectedResource("");

        alert(
          error.response?.data?.message ||
            "Failed to load resources"
        );
      }
    };

    fetchResources();
  }, [selectedGround]);

  // ==========================================
  // GET AVAILABILITY
  // ==========================================

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedResource || !selectedDate) {
        setAvailability(null);
        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/availability/${selectedResource}?date=${selectedDate}`
        );

        setAvailability(response.data);
      } catch (error) {
        console.error("Get availability error:", error);

        setAvailability(null);

        alert(
          error.response?.data?.message ||
            "Failed to load availability"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedResource, selectedDate]);

  // ==========================================
  // CURRENT GROUND
  // ==========================================

  const currentGround = useMemo(() => {
    return grounds.find(
      (ground) =>
        String(ground.id) === String(selectedGround)
    );
  }, [grounds, selectedGround]);

  // ==========================================
  // CURRENT RESOURCE
  // ==========================================

  const currentResource = useMemo(() => {
    return resources.find(
      (resource) =>
        String(resource.id) === String(selectedResource)
    );
  }, [resources, selectedResource]);

  // ==========================================
  // TIME HELPERS
  // ==========================================

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time
      .slice(0, 5)
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
      .slice(0, 5)
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==========================================
  // TIMELINE
  // ==========================================

  const timelineSlots = useMemo(() => {
    if (!availability?.operatingHours) {
      return [];
    }

    const openingTime =
      availability.operatingHours.opening_time;

    const closingTime =
      availability.operatingHours.closing_time;

    const openingMinutes = timeToMinutes(openingTime);
    const closingMinutes = timeToMinutes(closingTime);

    const slots = [];

    for (
      let current = openingMinutes;
      current < closingMinutes;
      current += 60
    ) {
      const slotEnd = Math.min(
        current + 60,
        closingMinutes
      );

      const startTime = minutesToTime(current);

      const isBooked = (
        availability.booked || []
      ).some((booking) => {
        return (
          timeToMinutes(booking.start_time) <
            slotEnd &&
          timeToMinutes(booking.end_time) >
            current
        );
      });

      const isBlocked = (
        availability.blocked || []
      ).some((block) => {
        return (
          timeToMinutes(block.start_time) <
            slotEnd &&
          timeToMinutes(block.end_time) >
            current
        );
      });

      let status = "available";

      if (isBooked) {
        status = "booked";
      } else if (isBlocked) {
        status = "blocked";
      }

      slots.push({
        startTime,
        status,
      });
    }

    return slots;
  }, [availability]);

  // ==========================================
  // OPEN MODAL
  // ==========================================

  const openBlockModal = (type) => {
    if (!selectedResource) {
      alert("Please select a resource first.");
      return;
    }

    setBlockType(type);

    setBlockForm({
      date: selectedDate,
      start_time:
        currentResource?.opening_time?.slice(0, 5) ||
        "13:00",
      end_time:
        currentResource?.closing_time?.slice(0, 5) ||
        "14:00",
      reason: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // BLOCK FORM CHANGE
  // ==========================================

  const handleBlockChange = (event) => {
    const { name, value } = event.target;

    setBlockForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE BLOCK
  // ==========================================

  const handleCreateBlock = async (event) => {
    event.preventDefault();

    if (!selectedResource) {
      alert("Please select a resource.");
      return;
    }

    let startTime = blockForm.start_time;
    let endTime = blockForm.end_time;

    if (blockType === "FULL_DAY") {
      startTime =
        currentResource?.opening_time?.slice(0, 5);

      endTime =
        currentResource?.closing_time?.slice(0, 5);
    }

    if (!startTime || !endTime) {
      alert("Resource operating hours are unavailable.");
      return;
    }

    try {
      await api.post("/availability-blocks", {
        resource_id: Number(selectedResource),
        block_date: blockForm.date,
        start_time: startTime,
        end_time: endTime,
        reason: blockForm.reason || null,
      });

      setShowModal(false);

      setSelectedDate(blockForm.date);

      const response = await api.get(
        `/availability/${selectedResource}?date=${blockForm.date}`
      );

      setAvailability(response.data);
    } catch (error) {
      console.error("Create block error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to block availability"
      );
    }
  };

  // ==========================================
  // DELETE BLOCK
  // ==========================================

  const handleDeleteBlock = async (blockId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this availability block?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/availability-blocks/${blockId}`
      );

      const response = await api.get(
        `/availability/${selectedResource}?date=${selectedDate}`
      );

      setAvailability(response.data);
    } catch (error) {
      console.error("Delete block error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to remove availability block"
      );
    }
  };

  return (
    <>
     <div className="admin-shell">
      <OwnerSidebar />
      

      <main className="admin-main">

        {/* TOPBAR */}

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
              onClick={() =>
                openBlockModal("FULL_DAY")
              }
            >
              + Block Date
            </button>

            <button
              className="btn btn--primary btn--sm"
              type="button"
              onClick={() =>
                openBlockModal("TIME")
              }
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
                onChange={(event) => {
                  setSelectedGround(
                    event.target.value
                  );

                  setSelectedResource("");

                  setAvailability(null);
                }}
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
                disabled={!selectedGround}
                onChange={(event) => {
                  setSelectedResource(
                    event.target.value
                  );

                  setAvailability(null);
                }}
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
                min={today}
                onChange={(event) => {
                  setSelectedDate(
                    event.target.value
                  );

                  setBlockForm((previous) => ({
                    ...previous,
                    date: event.target.value,
                  }));
                }}
              />
            </div>

          </div>

          {/* OPERATING HOURS */}

          {availability &&
            availability.operatingHours &&
            currentResource && (
              <div className="avail-hours-banner">

                <span>
                  Operating Hours:{" "}
                  {formatTime(
                    availability.operatingHours
                      .opening_time
                  )}{" "}
                  –{" "}
                  {formatTime(
                    availability.operatingHours
                      .closing_time
                  )}
                </span>

                <span>
                  {currentResource.name} ·{" "}
                  {currentGround?.name || ""}
                </span>

              </div>
            )}

          {/* LEGEND */}

          {selectedResource && (
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
          )}

          {/* TIMELINE */}

          <div className="avail-timeline">

            {loading ? (
              <div>
                Loading availability...
              </div>
            ) : !selectedResource ? (
              <div>
                Select a ground and resource to view
                availability.
              </div>
            ) : timelineSlots.length === 0 ? (
              <div>
                No availability found.
              </div>
            ) : (
              timelineSlots.map((slot) => (
                <div
                  key={slot.startTime}
                  className={`avail-slot avail-slot--${slot.status}`}
                >
                  <div className="avail-slot__time">
                    {formatTime(slot.startTime)}
                  </div>

                  <div className="avail-slot__status">
                    {slot.status === "available"
                      ? "Available"
                      : slot.status === "booked"
                      ? "Booked"
                      : "Blocked"}
                  </div>
                </div>
              ))
            )}

          </div>

        </div>
      </main>

      {/* ==========================================
          COMBINED BLOCK MODAL
      ========================================== */}

      {showModal && (
        <div
          className="modal-backdrop"
          style={{ display: "flex" }}
        >

          <div className="modal-card">

            <div className="modal-card__head">

              <h3>Block Availability</h3>

              <button
                className="modal-close"
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleCreateBlock}>

              <div className="field">

                <label>Block Type</label>

                <select
                  value={blockType}
                  onChange={(event) =>
                    setBlockType(
                      event.target.value
                    )
                  }
                >
                  <option value="TIME">
                    Specific Time
                  </option>

                  <option value="FULL_DAY">
                    Full Day
                  </option>
                </select>

              </div>

              <div className="field">

                <label>Date</label>

                <input
                  type="date"
                  name="date"
                  value={blockForm.date}
                  min={today}
                  onChange={handleBlockChange}
                  required
                />

              </div>

              {blockType === "TIME" && (
                <div className="field--row">

                  <div className="field">

                    <label>Start Time</label>

                    <input
                      type="time"
                      name="start_time"
                      value={
                        blockForm.start_time
                      }
                      onChange={
                        handleBlockChange
                      }
                      required
                    />

                  </div>

                  <div className="field">

                    <label>End Time</label>

                    <input
                      type="time"
                      name="end_time"
                      value={
                        blockForm.end_time
                      }
                      onChange={
                        handleBlockChange
                      }
                      required
                    />

                  </div>

                </div>
              )}

              {blockType === "FULL_DAY" &&
                currentResource && (
                  <div className="field">
                    <label>Operating Hours</label>

                    <input
                      type="text"
                      value={`${formatTime(
                        currentResource.opening_time
                      )} – ${formatTime(
                        currentResource.closing_time
                      )}`}
                      readOnly
                    />
                  </div>
                )}

              <div className="field">

                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  value={blockForm.reason}
                  onChange={handleBlockChange}
                  placeholder="e.g. Maintenance"
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn--primary"
                >
                  Block Availability
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default OwnerAvailability;