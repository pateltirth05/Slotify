import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../style/style.css";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Navbard from "../components/Navbard.jsx";
import Footer from "../components/Footer.jsx";

const ResourseBooking = () => {
  const { groundId, resourceId } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [availability, setAvailability] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loadingResource, setLoadingResource] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [error, setError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
const { user } = useAuth();
  /*
    ------------------------------------------
    Get today's date in YYYY-MM-DD format
    ------------------------------------------
  */

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
    ------------------------------------------
    Format time from backend to 12-hour format
    ------------------------------------------
  */

  const formatTime12Hour = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    let hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
      hour = 12;
    }

    return `${hour}:${minutes} ${period}`;
  };

  /*
    ------------------------------------------
    Convert backend time into minutes
    ------------------------------------------
  */

  const timeToMinutes = (time) => {
    if (!time) {
      return 0;
    }

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  /*
    ------------------------------------------
    Convert minutes back to HH:MM
    ------------------------------------------
  */

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(
      remainingMinutes
    ).padStart(2, "0")}`;
  };

  /*
    ------------------------------------------
    Fetch exact resource
    ------------------------------------------
  */

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoadingResource(true);
        setError("");

        const response = await api.get(
          `/resources/${resourceId}`
        );

        setResource(response.data.resource);
      } catch (error) {
        console.error("Fetch resource error:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load resource details."
        );
      } finally {
        setLoadingResource(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  /*
    ------------------------------------------
    Fetch availability for selected date
    ------------------------------------------
  */

  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        setAvailabilityError("");

        setStartTime("");
        setEndTime("");

        const response = await api.get(
          `/availability/${resourceId}`,
          {
            params: {
              date: selectedDate,
            },
          }
        );

        setAvailability(response.data);
      } catch (error) {
        console.error(
          "Fetch availability error:",
          error
        );

        setAvailability(null);

        setAvailabilityError(
          error.response?.data?.message ||
          "Unable to load availability."
        );
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, resourceId]);

  /*
    ------------------------------------------
    Check whether a time is inside a booked slot
    ------------------------------------------
  */

  const isTimeBooked = (time) => {
    if (!availability) {
      return false;
    }

    const selectedMinutes = timeToMinutes(time);

    return availability.booked_slots?.some(
      (slot) => {
        const start = timeToMinutes(
          slot.start_time
        );

        const end = timeToMinutes(
          slot.end_time
        );

        return (
          selectedMinutes >= start &&
          selectedMinutes < end
        );
      }
    );
  };

  /*
    ------------------------------------------
    Check whether a time is inside a blocked slot
    ------------------------------------------
  */

  const getBlockedSlot = (time) => {
    if (!availability) {
      return null;
    }

    const selectedMinutes = timeToMinutes(time);

    return (
      availability.blocked_slots?.find(
        (slot) => {
          const start = timeToMinutes(
            slot.start_time
          );

          const end = timeToMinutes(
            slot.end_time
          );

          return (
            selectedMinutes >= start &&
            selectedMinutes < end
          );
        }
      ) || null
    );
  };

  /*
    ------------------------------------------
    Generate selectable time options
    Every 30 minutes
    ------------------------------------------
  */

  const generateTimeOptions = () => {
    if (!availability?.resource) {
      return [];
    }

    const openingMinutes = timeToMinutes(
      availability.resource.opening_time
    );

    const closingMinutes = timeToMinutes(
      availability.resource.closing_time
    );

    const options = [];

    for (
      let minutes = openingMinutes;
      minutes < closingMinutes;
      minutes += 30
    ) {
      const time = minutesToTime(minutes);

      options.push({
        value: time,
        label: formatTime12Hour(time),
        booked: isTimeBooked(time),
        blocked: Boolean(getBlockedSlot(time)),
      });
    }

    return options;
  };

  /*
    ------------------------------------------
    Calculate duration
    ------------------------------------------
  */

  const calculateDuration = () => {
    if (!startTime || !endTime) {
      return 0;
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end <= start) {
      return 0;
    }

    return (end - start) / 60;
  };

  const duration = calculateDuration();

  /*
    ------------------------------------------
    Calculate total
    ------------------------------------------
  */

  const pricePerHour = Number(
    resource?.price_per_hour || 0
  );

  const totalAmount = duration * pricePerHour;

  /*
    ------------------------------------------
    Check whether selected range overlaps
    booked or blocked intervals
    ------------------------------------------
  */

  const selectedRangeHasConflict = () => {
    if (
      !availability ||
      !startTime ||
      !endTime
    ) {
      return false;
    }

    const selectedStart =
      timeToMinutes(startTime);

    const selectedEnd =
      timeToMinutes(endTime);

    const bookedConflict =
      availability.booked_slots?.some(
        (slot) => {
          const bookedStart =
            timeToMinutes(slot.start_time);

          const bookedEnd =
            timeToMinutes(slot.end_time);

          return (
            selectedStart < bookedEnd &&
            selectedEnd > bookedStart
          );
        }
      );

    if (bookedConflict) {
      return true;
    }

    const blockedConflict =
      availability.blocked_slots?.some(
        (slot) => {
          const blockedStart =
            timeToMinutes(slot.start_time);

          const blockedEnd =
            timeToMinutes(slot.end_time);

          return (
            selectedStart < blockedEnd &&
            selectedEnd > blockedStart
          );
        }
      );

    return Boolean(blockedConflict);
  };

  /*
    ------------------------------------------
    Handle start time change
    ------------------------------------------
  */

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
    setEndTime("");
  };

  /*
    ------------------------------------------
    Handle end time change
    ------------------------------------------
  */

  const handleEndTimeChange = (event) => {
    const value = event.target.value;

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(value);

    if (end <= start) {
      setEndTime("");
      return;
    }

    setEndTime(value);
  };

  /*
    ------------------------------------------
    Continue to booking
    ------------------------------------------
  */

  const handleContinue = () => {
    if (!selectedDate) {
      setAvailabilityError(
        "Please select a date."
      );
      return;
    }

    if (!startTime || !endTime) {
      setAvailabilityError(
        "Please select both start and end time."
      );
      return;
    }

    if (duration <= 0) {
      setAvailabilityError(
        "Please select a valid time range."
      );
      return;
    }

    if (selectedRangeHasConflict()) {
      setAvailabilityError(
        "The selected time overlaps with a booked or blocked period. Please choose another time."
      );
      return;
    }
 if (!user) {
  navigate("/login", {
    state: {
      redirectTo: `/grounds/${groundId}/resources/${resourceId}/booking`,
      bookingData: {
        resource,
        selectedDate,
        startTime,
        endTime,
        duration,
        totalAmount,
      },
    },
  });

  return;
}
    /*
      For now we only move to the next booking step.
      Payment page will be connected later.
    */

    navigate(
      `/grounds/${groundId}/resources/${resourceId}/booking`,
      {
        state: {
          resource,
          selectedDate,
          startTime,
          endTime,
          duration,
          totalAmount,
        },
      }
    );
  };

  /*
    ------------------------------------------
    Loading resource
    ------------------------------------------
  */

  if (loadingResource) {
    return (
      <main className="container">
        <p>Loading resource details...</p>
      </main>
    );
  }

  /*
    ------------------------------------------
    Resource error
    ------------------------------------------
  */

  if (error || !resource) {
    return (
      <main className="container">
        <p>{error || "Resource not found."}</p>

        <Link to={`/grounds/${groundId}`}>
          ← Back to ground
        </Link>
      </main>
    );
  }

  const timeOptions = generateTimeOptions();

  /*
    End times should only show times after
    selected start time and before closing.
  */

  const endTimeOptions = timeOptions.filter(
    (option) => {
      if (!startTime) {
        return false;
      }

      return (
        timeToMinutes(option.value) >
        timeToMinutes(startTime)
      );
    }
  );

  return (
    <>
    <Navbard/>
      <div
        className="container"
        style={{ paddingTop: "32px" }}
      >

        {/* Back */}
        <Link
          to={`/grounds/${groundId}`}
          className="eyebrow"
          style={{ marginBottom: "20px" }}
        >
          ← BACK TO GROUND
        </Link>

        {/* Gallery */}
        <div className="gallery">

          <div className="gallery__main">
            <img
              src={
                resource.photos?.[0] ||
                "/placeholder-ground.jpg"
              }
              alt={resource.name}
            />
          </div>

          <div className="gallery__thumb">
            <img
              src={
                resource.photos?.[1] ||
                resource.photos?.[0] ||
                "/placeholder-ground.jpg"
              }
              alt={resource.name}
            />
          </div>

          <div
            className="gallery__thumb"
            style={{ position: "relative" }}
          >
            <img
              src={
                resource.photos?.[2] ||
                resource.photos?.[0] ||
                "/placeholder-ground.jpg"
              }
              alt={resource.name}
            />

            {resource.photos?.length > 3 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "rgba(22,33,26,.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: ".9rem",
                }}
              >
                +{resource.photos.length - 3} photos
              </div>
            )}
          </div>

        </div>

        {/* Details */}
        <div className="detail-grid">

          <div>

            <div className="detail-head">

              <div>

                <h1
                  style={{
                    fontSize: "2.4rem",
                  }}
                >
                  {resource.name}
                </h1>

                <div
                  className="ground-card__loc"
                  style={{ marginTop: "8px" }}
                >
                  {resource.sport_type}
                </div>

              </div>

            </div>

            {/* Resource information */}
            <div className="ground-card__facilities">

              <span className="chip">
                {resource.sport_type}
              </span>

              <span className="chip">
                Open{" "}
                {formatTime12Hour(
                  resource.opening_time
                )}
              </span>

              <span className="chip">
                Close{" "}
                {formatTime12Hour(
                  resource.closing_time
                )}
              </span>

            </div>

            {/* Overview */}
            <div id="overview">

              <h3
                style={{
                  marginBottom: "12px",
                }}
              >
                About this resource
              </h3>

              <p
                style={{
                  color: "var(--c-ink-soft)",
                }}
              >
                Book this {resource.sport_type}{" "}
                resource according to your preferred
                date and playing duration.
              </p>

            </div>

            {/* Availability information */}
            <div
              style={{
                marginTop: "32px",
              }}
            >

              <h3
                style={{
                  marginBottom: "16px",
                }}
              >
                Availability
              </h3>

              {!selectedDate && (
                <p
                  style={{
                    color:
                      "var(--c-ink-soft)",
                  }}
                >
                  Select a date to see available,
                  booked and blocked timings.
                </p>
              )}

              {selectedDate &&
                loadingAvailability && (
                  <p>
                    Loading availability...
                  </p>
                )}

              {availabilityError && (
                <p className="groundsError">
                  {availabilityError}
                </p>
              )}

              {availability &&
                !loadingAvailability && (
                  <div>

                    <p
                      style={{
                        color:
                          "var(--c-ink-soft)",
                        marginBottom: "12px",
                      }}
                    >
                      Operating hours:{" "}
                      <strong>
                        {formatTime12Hour(
                          availability.resource
                            .opening_time
                        )}
                      </strong>{" "}
                      –{" "}
                      <strong>
                        {formatTime12Hour(
                          availability.resource
                            .closing_time
                        )}
                      </strong>
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "18px",
                        flexWrap: "wrap",
                        fontSize: ".85rem",
                      }}
                    >

                      <span>
                        🟢 Available
                      </span>

                      <span>
                        🔴 Booked
                      </span>

                      <span>
                        🟠 Blocked
                      </span>

                    </div>

                  </div>
                )}

            </div>

            {/* Existing booked slots */}
            {availability &&
              availability.booked_slots?.length >
                0 && (

                <div
                  style={{
                    marginTop: "28px",
                  }}
                >

                  <h3
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    Booked Times
                  </h3>

                  {availability.booked_slots.map(
                    (slot) => (
                      <div
                        className="card"
                        key={slot.booking_id}
                        style={{
                          marginBottom: "8px",
                        }}
                      >
                        🔴{" "}
                        {formatTime12Hour(
                          slot.start_time
                        )}{" "}
                        –{" "}
                        {formatTime12Hour(
                          slot.end_time
                        )}
                      </div>
                    )
                  )}

                </div>
              )}

            {/* Blocked slots */}
            {availability &&
              availability.blocked_slots?.length >
                0 && (

                <div
                  style={{
                    marginTop: "28px",
                  }}
                >

                  <h3
                    style={{
                      marginBottom: "12px",
                    }}
                  >
                    Blocked Times
                  </h3>

                  {availability.blocked_slots.map(
                    (slot) => (
                      <div
                        className="card"
                        key={slot.block_id}
                        style={{
                          marginBottom: "8px",
                        }}
                      >
                        🟠{" "}
                        {formatTime12Hour(
                          slot.start_time
                        )}{" "}
                        –{" "}
                        {formatTime12Hour(
                          slot.end_time
                        )}

                        {slot.reason && (
                          <span
                            style={{
                              marginLeft: "8px",
                              color:
                                "var(--c-ink-soft)",
                            }}
                          >
                            ({slot.reason})
                          </span>
                        )}
                      </div>
                    )
                  )}

                </div>
              )}

          </div>

          {/* Booking Card */}
          <aside className="booking-card">

            {/* Price */}
            <div className="booking-card__price">
              ₹
              {pricePerHour.toLocaleString(
                "en-IN"
              )}

              <span>
                / hour
              </span>
            </div>

            {/* Date */}
            <div
              style={{
                margin: "16px 0",
              }}
            >

              <label
                style={{
                  fontWeight: 700,
                  fontSize: ".85rem",
                }}
                htmlFor="bookingDate"
              >
                Select date
              </label>

              <input
                id="bookingDate"
                type="date"
                min={getTodayDate()}
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "11px 13px",
                  borderRadius:
                    "var(--r-md)",
                  border:
                    "1.5px solid var(--c-line)",
                }}
              />

            </div>

            {/* Start time */}
            <div>

              <label
                style={{
                  fontWeight: 700,
                  fontSize: ".85rem",
                }}
                htmlFor="startTime"
              >
                Start time
              </label>

              <select
                id="startTime"
                value={startTime}
                onChange={
                  handleStartTimeChange
                }
                disabled={
                  !availability ||
                  loadingAvailability
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "11px 13px",
                  borderRadius:
                    "var(--r-md)",
                  border:
                    "1.5px solid var(--c-line)",
                }}
              >

                <option value="">
                  Select start time
                </option>

                {timeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={
                      option.booked ||
                      option.blocked
                    }
                  >
                    {option.label}
                    {option.booked
                      ? " — Booked"
                      : ""}
                    {option.blocked
                      ? " — Blocked"
                      : ""}
                  </option>
                ))}

              </select>

            </div>

            {/* End time */}
            <div
              style={{
                marginTop: "16px",
              }}
            >

              <label
                style={{
                  fontWeight: 700,
                  fontSize: ".85rem",
                }}
                htmlFor="endTime"
              >
                End time
              </label>

              <select
                id="endTime"
                value={endTime}
                onChange={
                  handleEndTimeChange
                }
                disabled={
                  !startTime ||
                  !availability ||
                  loadingAvailability
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "11px 13px",
                  borderRadius:
                    "var(--r-md)",
                  border:
                    "1.5px solid var(--c-line)",
                }}
              >

                <option value="">
                  Select end time
                </option>

                {endTimeOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={
                        option.booked ||
                        option.blocked
                      }
                    >
                      {option.label}
                      {option.booked
                        ? " — Booked"
                        : ""}
                      {option.blocked
                        ? " — Blocked"
                        : ""}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* Conflict message */}
            {selectedRangeHasConflict() && (
              <p
                style={{
                  marginTop: "12px",
                  color: "#b42318",
                  fontSize: ".85rem",
                }}
              >
                The selected range overlaps a
                booked or blocked period.
              </p>
            )}

            {/* Summary */}
            <div
              className="summary-row"
              style={{
                marginTop: "20px",
              }}
            >

              <span>
                {duration > 0
                  ? `${duration} hours × ₹${pricePerHour}`
                  : "Select a time range"}
              </span>

              <span>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>

            </div>

            <div className="summary-row total">

              <span>
                Total
              </span>

              <span>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>

            </div>

            {/* Continue */}
            <button
              type="button"
              className="btn btn--primary btn--block btn--lg"
              style={{
                marginTop: "16px",
              }}
              onClick={handleContinue}
              disabled={
                !selectedDate ||
                !startTime ||
                !endTime ||
                duration <= 0 ||
                selectedRangeHasConflict()
              }
            >
              Continue to Book
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: ".78rem",
                color:
                  "var(--c-ink-faint)",
                marginTop: "10px",
              }}
            >
              Availability is checked using
              real-time booking and blocked
              periods.
            </p>

          </aside>

        </div>

      </div>
      <Footer/>
    </>
  );
};

export default ResourseBooking;