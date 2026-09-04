import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [settlementFilter, setSettlementFilter] =
    useState("ALL");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [admin] = useState({
    name: "Administrator",
  });

  // --------------------------------
  // HELPERS
  // --------------------------------

  const getInitials = (name) => {
    if (!name) return "A";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatAmount = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // --------------------------------
  // LOAD PAYMENTS
  // --------------------------------

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/payments"
      );

      setPayments(
        response.data.payments || []
      );
    } catch (err) {
      console.error(
        "Failed to load payments:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // --------------------------------
  // SETTLE PAYMENT
  // --------------------------------

  const handleSettlement = async (payment) => {
    if (
      payment.payment_method !== "ONLINE"
    ) {
      alert(
        "Only online payments can be settled through Slotify."
      );
      return;
    }

    if (
      payment.payment_status !== "PAID"
    ) {
      alert(
        "Only paid payments can be settled."
      );
      return;
    }

    if (
      payment.settlement_status === "SETTLED"
    ) {
      alert(
        "This payment is already settled."
      );
      return;
    }

    const confirmed = window.confirm(
      `Confirm that ${formatAmount(
        payment.amount
      )} has been transferred to the owner?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(payment.id);

      await api.patch(
        `/admin/payments/${payment.id}/settlement`
      );

      setPayments((currentPayments) =>
        currentPayments.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                settlement_status:
                  "SETTLED",
              }
            : item
        )
      );

      alert(
        "Payment marked as settled."
      );
    } catch (err) {
      console.error(
        "Failed to settle payment:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to settle payment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------
  // FILTER
  // --------------------------------

  const filteredPayments = payments.filter(
    (payment) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchText ||
        String(payment.id)
          .toLowerCase()
          .includes(searchText) ||
        String(payment.booking_id)
          .toLowerCase()
          .includes(searchText) ||
        payment.customer_name
          ?.toLowerCase()
          .includes(searchText) ||
        payment.owner_name
          ?.toLowerCase()
          .includes(searchText) ||
        payment.ground_name
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        payment.payment_status ===
          statusFilter;

      const matchesSettlement =
        settlementFilter === "ALL" ||
        payment.settlement_status ===
          settlementFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSettlement
      );
    }
  );

  // --------------------------------
  // SUMMARY
  // --------------------------------

  const onlinePayments = payments.filter(
    (payment) =>
      payment.payment_method === "ONLINE"
  );

  const paidPayments = payments.filter(
    (payment) =>
      payment.payment_status === "PAID"
  );

  const pendingSettlements =
    payments.filter(
      (payment) =>
        payment.payment_method ===
          "ONLINE" &&
        payment.payment_status === "PAID" &&
        payment.settlement_status ===
          "PENDING"
    );

  const settledPayments = payments.filter(
    (payment) =>
      payment.payment_method ===
        "ONLINE" &&
      payment.payment_status === "PAID" &&
      payment.settlement_status ===
        "SETTLED"
  );

  const totalPaidAmount =
    paidPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );

  const pendingSettlementAmount =
    pendingSettlements.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );

  const settledAmount =
    settledPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">

        {/* TOPBAR */}
        <div className="admin-topbar">

          <button
            type="button"
            className="hamburger-btn"
          >
            ☰
          </button>

          <h2>Payments</h2>

          <div className="topbar-right">

            <button
              type="button"
              className="bell-btn"
            >
              🔔
              <span className="bell-dot"></span>
            </button>

            <div className="owner-identity">

              <div className="owner-identity__avatar">
                {getInitials(admin.name)}
              </div>

              <div>
                <b>
                  {admin.name ||
                    "Administrator"}
                </b>

                <div className="role-tag">
                  Administrator
                </div>
              </div>

            </div>

          </div>

        </div>

        <div className="admin-body">

          {/* HEADER */}
          <div
            className="dash-greeting"
            style={{
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "1.7rem",
              }}
            >
              Payments
            </h2>

            <p>
              Monitor customer payments and
              owner settlement status.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div
            className="stat-grid"
            style={{
              gridTemplateColumns:
                "repeat(4, 1fr)",
            }}
          >

            <div className="stat-card">

              <div className="stat-card__top">
                <div className="stat-card__icon">
                  💳
                </div>
              </div>

              <b>
                {onlinePayments.length}
              </b>

              <span>
                Online Payments
              </span>

            </div>

            <div className="stat-card">

              <div className="stat-card__top">
                <div className="stat-card__icon">
                  💰
                </div>
              </div>

              <b>
                {formatAmount(
                  totalPaidAmount
                )}
              </b>

              <span>
                Total Paid
              </span>

            </div>

            <div className="stat-card">

              <div className="stat-card__top">
                <div className="stat-card__icon">
                  ⏳
                </div>
              </div>

              <b>
                {formatAmount(
                  pendingSettlementAmount
                )}
              </b>

              <span>
                Pending Settlement
              </span>

            </div>

            <div className="stat-card">

              <div className="stat-card__top">
                <div className="stat-card__icon">
                  ✅
                </div>
              </div>

              <b>
                {formatAmount(
                  settledAmount
                )}
              </b>

              <span>
                Settled Amount
              </span>

            </div>

          </div>

          {/* FILTERS */}
          <div
            className="table-card"
            style={{
              marginTop: "24px",
              marginBottom: "24px",
            }}
          >

            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >

              {/* SEARCH */}
              <div
                style={{
                  flex: "1",
                  minWidth: "240px",
                }}
              >

                <input
                  type="text"
                  placeholder="Search payment, booking, customer, owner..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding:
                      "12px 14px",
                    border:
                      "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />

              </div>

              {/* PAYMENT STATUS */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "12px 14px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >

                <option value="ALL">
                  All Payment Status
                </option>

                <option value="PAID">
                  Paid
                </option>

                <option value="CREATED">
                  Created
                </option>

                <option value="FAILED">
                  Failed
                </option>

              </select>

              {/* SETTLEMENT */}
              <select
                value={settlementFilter}
                onChange={(e) =>
                  setSettlementFilter(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "12px 14px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >

                <option value="ALL">
                  All Settlements
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="SETTLED">
                  Settled
                </option>

              </select>

              {/* CLEAR */}
              {(search ||
                statusFilter !==
                  "ALL" ||
                settlementFilter !==
                  "ALL") && (

                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter(
                      "ALL"
                    );
                    setSettlementFilter(
                      "ALL"
                    );
                  }}
                >
                  Clear Filters
                </button>

              )}

            </div>

          </div>

          {/* PAYMENT HISTORY */}
          <div className="table-card">

            <div className="table-card__head">

              <h3
                style={{
                  fontFamily:
                    "var(--font-body)",
                  fontSize:
                    "1.1rem",
                  fontWeight: 800,
                }}
              >
                Payment History
              </h3>

              <span>
                {filteredPayments.length}{" "}
                payment
                {filteredPayments.length !==
                1
                  ? "s"
                  : ""}
              </span>

            </div>

            {loading ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding: "40px",
                }}
              >
                Loading payments...
              </div>

            ) : error ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding: "40px",
                }}
              >

                <p>{error}</p>

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={
                    loadPayments
                  }
                >
                  Try Again
                </button>

              </div>

            ) : (

              <div
                style={{
                  overflowX:
                    "auto",
                }}
              >

                <table>

                  <thead>
                    <tr>
                      <th>
                        Payment
                      </th>

                      <th>
                        Booking
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Owner
                      </th>

                      <th>
                        Ground
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Settlement
                      </th>

                      <th>
                        Paid At
                      </th>

                      <th>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredPayments.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="10"
                          style={{
                            textAlign:
                              "center",
                            padding:
                              "40px",
                          }}
                        >
                          No payments
                          found.
                        </td>

                      </tr>

                    ) : (

                      filteredPayments.map(
                        (payment) => (

                          <tr
                            key={
                              payment.id
                            }
                          >

                            {/* PAYMENT */}
                            <td>
                              <b>
                                #
                                {
                                  payment.id
                                }
                              </b>
                            </td>

                            {/* BOOKING */}
                            <td>
                              <b>
                                #
                                {
                                  payment.booking_id
                                }
                              </b>
                            </td>

                            {/* CUSTOMER */}
                            <td>
                              <div>
                                <b>
                                  {
                                    payment.customer_name ||
                                    "-"
                                  }
                                </b>

                                {payment.customer_email && (
                                  <div
                                    style={{
                                      fontSize:
                                        "11px",
                                      color:
                                        "#888",
                                      marginTop:
                                        "3px",
                                    }}
                                  >
                                    {
                                      payment.customer_email
                                    }
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* OWNER */}
                            <td>
                              <div>
                                <b>
                                  {
                                    payment.owner_name ||
                                    "-"
                                  }
                                </b>

                                {payment.owner_email && (
                                  <div
                                    style={{
                                      fontSize:
                                        "11px",
                                      color:
                                        "#888",
                                      marginTop:
                                        "3px",
                                    }}
                                  >
                                    {
                                      payment.owner_email
                                    }
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* GROUND */}
                            <td>
                              <div>
                                <b>
                                  {
                                    payment.ground_name ||
                                    "-"
                                  }
                                </b>

                                {payment.resource_name && (
                                  <div
                                    style={{
                                      fontSize:
                                        "11px",
                                      color:
                                        "#888",
                                      marginTop:
                                        "3px",
                                    }}
                                  >
                                    {
                                      payment.resource_name
                                    }
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* AMOUNT */}
                            <td>
                              <b>
                                {formatAmount(
                                  payment.amount
                                )}
                              </b>
                            </td>

                            {/* PAYMENT */}
                            <td>

                              <span
                                className={
                                  payment.payment_status ===
                                  "PAID"
                                    ? "badge badge--active"
                                    : "badge"
                                }
                              >
                                {payment.payment_status ||
                                  "-"}
                              </span>

                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  color:
                                    "#888",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  payment.payment_method ||
                                  "-"
                                }
                              </div>

                            </td>

                            {/* SETTLEMENT */}
                            <td>

                              <span
                                className={
                                  payment.settlement_status ===
                                  "SETTLED"
                                    ? "badge badge--active"
                                    : "badge"
                                }
                              >
                                {payment.settlement_status ||
                                  "PENDING"}
                              </span>

                            </td>

                            {/* PAID AT */}
                            <td>
                              {formatDateTime(
                                payment.paid_at
                              )}
                            </td>

                            {/* ACTION */}
                            <td>

                              {payment.payment_method !==
                              "ONLINE" ? (

                                <span
                                  style={{
                                    color:
                                      "#888",
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  Cash
                                </span>

                              ) : payment.payment_status !==
                                "PAID" ? (

                                <span
                                  style={{
                                    color:
                                      "#888",
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  Not paid
                                </span>

                              ) : payment.settlement_status ===
                                "SETTLED" ? (

                                <span
                                  style={{
                                    color:
                                      "#2e7d32",
                                    fontSize:
                                      "12px",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Settled
                                </span>

                              ) : (

                                <button
                                  type="button"
                                  className="btn btn--outline btn--sm"
                                  disabled={
                                    updatingId ===
                                    payment.id
                                  }
                                  onClick={() =>
                                    handleSettlement(
                                      payment
                                    )
                                  }
                                >
                                  {updatingId ===
                                  payment.id
                                    ? "Settling..."
                                    : "Settle"}
                                </button>

                              )}

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* NOTE */}
          <div
            style={{
              marginTop: "20px",
              padding:
                "16px 20px",
              border:
                "1px solid #e5e5e5",
              borderRadius:
                "10px",
              background:
                "#fafafa",
              fontSize:
                "13px",
              color:
                "#666",
            }}
          >

            <b
              style={{
                color: "#333",
              }}
            >
              Settlement process:
            </b>{" "}

            Online customer payments
            are received through
            Slotify's Razorpay account.
            The admin transfers the
            applicable amount to the
            owner's registered payment
            details and then marks the
            payment as{" "}

            <b>SETTLED</b>.

            Cash payments are paid
            directly to the owner and
            are not settled through this
            page.

          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminPayments;