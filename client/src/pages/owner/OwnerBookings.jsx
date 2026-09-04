import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar.jsx";
import api from "../../services/api.js";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedGround, setSelectedGround] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const bookingsPerPage = 4;

  // ==========================================
  // FETCH OWNER BOOKINGS
  // ==========================================

useEffect(() => {
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await api.get("/bookings/owner");

      console.log("Owner bookings response:", response.data);

      const bookingData =
        response.data.bookings ||
        response.data.data ||
        [];

      setBookings(bookingData);
    } catch (error) {
      console.error(
        "Get owner bookings error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchBookings();
}, []);

  // ==========================================
  // UNIQUE GROUNDS
  // ==========================================

  const grounds = useMemo(() => {
    const uniqueGrounds = [];

    bookings.forEach((booking) => {
      const groundId =
        booking.ground_id ||
        booking.groundId;

      const groundName =
        booking.ground_name ||
        booking.groundName;

      if (
        groundId &&
        groundName &&
        !uniqueGrounds.some(
          (ground) =>
            String(ground.id) === String(groundId)
        )
      ) {
        uniqueGrounds.push({
          id: groundId,
          name: groundName,
        });
      }
    });

    return uniqueGrounds;
  }, [bookings]);

  // ==========================================
  // UNIQUE RESOURCES
  // ==========================================

  const resources = useMemo(() => {
    const uniqueResources = [];

    bookings.forEach((booking) => {
      const resourceId =
        booking.resource_id ||
        booking.resourceId;

      const resourceName =
        booking.resource_name ||
        booking.resourceName;

      if (
        resourceId &&
        resourceName &&
        !uniqueResources.some(
          (resource) =>
            String(resource.id) ===
            String(resourceId)
        )
      ) {
        uniqueResources.push({
          id: resourceId,
          name: resourceName,
        });
      }
    });

    return uniqueResources;
  }, [bookings]);

  // ==========================================
  // STATUS COUNTS
  // ==========================================

  const statusCounts = useMemo(() => {
    return {
      ALL: bookings.length,

      PENDING: bookings.filter(
        (booking) =>
          booking.status === "PENDING"
      ).length,

      CONFIRMED: bookings.filter(
        (booking) =>
          booking.status === "CONFIRMED"
      ).length,

      COMPLETED: bookings.filter(
        (booking) =>
          booking.status === "COMPLETED"
      ).length,

      CANCELLED: bookings.filter(
        (booking) =>
          booking.status === "CANCELLED"
      ).length,
    };
  }, [bookings]);

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filteredBookings = useMemo(() => {
  return bookings.filter((booking) => {

    if (
      selectedStatus !== "ALL" &&
      booking.status !== selectedStatus
    ) {
      return false;
    }

    if (
      selectedDate &&
      String(booking.booking_date).slice(0, 10) !== selectedDate
    ) {
      return false;
    }

    if (
      selectedGround &&
      String(booking.ground_id) !== String(selectedGround)
    ) {
      return false;
    }

    if (
      selectedResource &&
      String(booking.resource_id) !== String(selectedResource)
    ) {
      return false;
    }

    return true;
  });
}, [
  bookings,
  selectedStatus,
  selectedDate,
  selectedGround,
  selectedResource,
]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    filteredBookings.length / bookingsPerPage
  );

  const startIndex =
    (currentPage - 1) * bookingsPerPage;

  const endIndex =
    startIndex + bookingsPerPage;

  const currentBookings =
    filteredBookings.slice(
      startIndex,
      endIndex
    );

  // ==========================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatus,
    selectedDate,
    selectedGround,
    selectedResource,
  ]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

const formatDate = (date) => {
  if (!date) return "-";

  const dateString = String(date).slice(0, 10);

  const [year, month, day] = dateString.split("-");

  if (!year || !month || !day) {
    return "-";
  }

  const formattedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  if (Number.isNaN(formattedDate.getTime())) {
    return "-";
  }

  return formattedDate.toLocaleDateString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] =
      time.slice(0, 5)
        .split(":")
        .map(Number);

    const date = new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "₹0";
    }

    return `₹${Number(amount).toLocaleString(
      "en-IN"
    )}`;
  };

  // ==========================================
  // PAYMENT TEXT
  // ==========================================

const getPaymentText = (booking) => {
  const method = booking.payment_method;
  const status = booking.payment_status;

  if (!method && !status) return "";

  return `${method || ""} / ${status || ""}`;
};

  // ==========================================
  // STATUS BADGE CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "badge badge--upcoming";

      case "COMPLETED":
        return "badge badge--completed";

      case "PENDING":
        return "badge badge--pending";

      case "CANCELLED":
        return "badge badge--cancelled";

      default:
        return "badge";
    }
  };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  return (
    <div className="admin-shell">
      <OwnerSidebar />

      <main className="admin-main">

        {/* ==========================================
            TOPBAR
        ========================================== */}

        <div className="admin-topbar">

          <button
            className="hamburger-btn"
            type="button"
          >
            ☰
          </button>

          <h2>Bookings</h2>

        </div>

        {/* ==========================================
            BODY
        ========================================== */}

        <div className="admin-body">

          {/* ==========================================
              TABS
          ========================================== */}

          <div
            className="tabs"
            style={{
              background: "#fff",
              borderRadius:
                "var(--r-md) var(--r-md) 0 0",
              padding: "0 16px",
            }}
          >

            <a
              href="#"
              className={
                selectedStatus === "ALL"
                  ? "is-active"
                  : ""
              }
              onClick={(event) => {
                event.preventDefault();
                setSelectedStatus("ALL");
              }}
            >
              All ({statusCounts.ALL})
            </a>

            <a
              href="#"
              className={
                selectedStatus === "PENDING"
                  ? "is-active"
                  : ""
              }
              onClick={(event) => {
                event.preventDefault();
                setSelectedStatus("PENDING");
              }}
            >
              Pending ({statusCounts.PENDING})
            </a>

            <a
              href="#"
              className={
                selectedStatus === "CONFIRMED"
                  ? "is-active"
                  : ""
              }
              onClick={(event) => {
                event.preventDefault();
                setSelectedStatus("CONFIRMED");
              }}
            >
              Confirmed ({statusCounts.CONFIRMED})
            </a>

            <a
              href="#"
              className={
                selectedStatus === "COMPLETED"
                  ? "is-active"
                  : ""
              }
              onClick={(event) => {
                event.preventDefault();
                setSelectedStatus("COMPLETED");
              }}
            >
              Completed ({statusCounts.COMPLETED})
            </a>

            <a
              href="#"
              className={
                selectedStatus === "CANCELLED"
                  ? "is-active"
                  : ""
              }
              onClick={(event) => {
                event.preventDefault();
                setSelectedStatus("CANCELLED");
              }}
            >
              Cancelled ({statusCounts.CANCELLED})
            </a>

          </div>

          {/* ==========================================
              FILTERS
          ========================================== */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              margin: "16px 0 20px",
            }}
          >

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(
                  event.target.value
                )
              }
              style={{
                padding: "9px 14px",
                borderRadius:
                  "var(--r-pill)",
                border:
                  "1px solid var(--c-line)",
                background: "#fff",
              }}
            />

            <select
              value={selectedGround}
              onChange={(event) =>
                setSelectedGround(
                  event.target.value
                )
              }
              style={{
                padding: "9px 14px",
                borderRadius:
                  "var(--r-pill)",
                border:
                  "1px solid var(--c-line)",
                background: "#fff",
              }}
            >
              <option value="">
                All Grounds
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

            <select
              value={selectedResource}
              onChange={(event) =>
                setSelectedResource(
                  event.target.value
                )
              }
              style={{
                padding: "9px 14px",
                borderRadius:
                  "var(--r-pill)",
                border:
                  "1px solid var(--c-line)",
                background: "#fff",
              }}
            >
              <option value="">
                All Resources
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

          {/* ==========================================
              TABLE
          ========================================== */}

          <div className="table-card">

            <table>

              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Ground</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan="10">
                      Loading bookings...
                    </td>
                  </tr>

                ) : currentBookings.length === 0 ? (

                  <tr>
                    <td colSpan="10">
                      No bookings found.
                    </td>
                  </tr>

                ) : (

                  currentBookings.map(
                    (booking) => (
                      <tr key={booking.id}>

                        <td>
                          <b>
                            #{booking.id}
                          </b>
                        </td>

                        <td>
                          {booking.customer_name ||
                            booking.customerName ||
                            "-"}
                        </td>

                        <td>
                          {booking.ground_name ||
                            booking.groundName ||
                            "-"}
                        </td>

                        <td>
                          {booking.resource_name ||
                            booking.resourceName ||
                            "-"}
                        </td>

                        <td>
                          {formatDate(
                            booking.booking_date
                          )}
                        </td>

                        <td>
                          {formatTime(
                            booking.start_time
                          )}{" "}
                          –{" "}
                          {formatTime(
                            booking.end_time
                          )}
                        </td>

                        <td>
                          {formatAmount(
                            booking.total_amount
                          )}
                        </td>

                        <td>{getPaymentText(booking)}</td>

                        <td>
                          <span
                            className={getStatusClass(
                              booking.status
                            )}
                          >
                            {booking.status
                              ?.charAt(0)
                              .toUpperCase() +
                              booking.status
                                ?.slice(1)
                                .toLowerCase()}
                          </span>
                        </td>

                        <td>
                          <Link
                            to={`/owner/bookings/${booking.id}`}
                            className="btn btn--outline btn--sm"
                          >
                            View Details
                          </Link>
                        </td>

                      </tr>
                    )
                  )

                )}

              </tbody>

            </table>

            {/* ==========================================
                TABLE FOOTER
            ========================================== */}

            <div className="table-foot">

              <span>
                {filteredBookings.length === 0
                  ? "Showing 0 bookings"
                  : `Showing ${
                      startIndex + 1
                    }–${Math.min(
                      endIndex,
                      filteredBookings.length
                    )} of ${
                      filteredBookings.length
                    } bookings`}
              </span>

              {totalPages > 0 && (
                <div className="pagination">

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        currentPage - 1
                      )
                    }
                    disabled={
                      currentPage === 1
                    }
                  >
                    ‹
                  </button>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        currentPage === page
                          ? "is-active"
                          : ""
                      }
                      onClick={() =>
                        goToPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        currentPage + 1
                      )
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                  >
                    ›
                  </button>

                </div>
              )}

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default OwnerBookings;