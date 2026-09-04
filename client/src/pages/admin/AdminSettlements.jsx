import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";

const AdminSettlements = () => {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [ownerPaymentDetails, setOwnerPaymentDetails] =
    useState(null);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [settling, setSettling] = useState(false);

  const [admin, setAdmin] = useState({
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
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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

      setPayments(response.data.payments || []);
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
  // OPEN SETTLEMENT
  // --------------------------------

const openSettlement = async (payment) => {
  setSelectedPayment(payment);

  try {
    setLoadingDetails(true);
    setOwnerPaymentDetails(null);

    const response = await api.get(
      `/owner-payment/admin/${payment.owner_id}`
    );

    setOwnerPaymentDetails(
      response.data.payment_details || null
    );

  } catch (err) {
    console.error(
      "Failed to load owner payment details:",
      err
    );

    setOwnerPaymentDetails(null);
  } finally {
    setLoadingDetails(false);
  }
};

  // --------------------------------
  // CLOSE SETTLEMENT
  // --------------------------------

  const closeSettlement = () => {
    if (settling) return;

    setSelectedPayment(null);
    setOwnerPaymentDetails(null);
  };

  // --------------------------------
  // SETTLE PAYMENT
  // --------------------------------

  const handleSettlement = async () => {
    if (!selectedPayment) return;

    if (
      selectedPayment.payment_method !==
      "ONLINE"
    ) {
      alert(
        "Only online payments can be settled."
      );
      return;
    }

    if (
      selectedPayment.payment_status !==
      "PAID"
    ) {
      alert(
        "Only paid payments can be settled."
      );
      return;
    }

    if (
      selectedPayment.settlement_status ===
      "SETTLED"
    ) {
      alert(
        "This payment has already been settled."
      );
      return;
    }

    const confirmed = window.confirm(
      `Confirm that ${formatAmount(
        selectedPayment.amount
      )} has been transferred to ${
        selectedPayment.owner_name
      }?`
    );

    if (!confirmed) return;

    try {
      setSettling(true);

      await api.patch(
        `/admin/payments/${selectedPayment.id}/settlement`
      );

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === selectedPayment.id
            ? {
                ...payment,
                settlement_status:
                  "SETTLED",
              }
            : payment
        )
      );

      alert(
        "Payment marked as settled successfully."
      );

      closeSettlement();
    } catch (err) {
      console.error(
        "Settlement failed:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to settle payment."
      );
    } finally {
      setSettling(false);
    }
  };

  // --------------------------------
  // PENDING SETTLEMENTS
  // --------------------------------

  const pendingSettlements = payments.filter(
    (payment) =>
      payment.payment_method === "ONLINE" &&
      payment.payment_status === "PAID" &&
      payment.settlement_status ===
        "PENDING"
  );

  const filteredSettlements =
    pendingSettlements.filter((payment) => {
      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) return true;

      return (
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
          .includes(searchText)
      );
    });

  // --------------------------------
  // SUMMARY
  // --------------------------------

  const pendingAmount =
    pendingSettlements.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
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

          <h2>Settlements</h2>

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
              Owner Settlements
            </h2>

            <p>
              Transfer online payment earnings to
              owners and mark them as settled.
            </p>
          </div>

          {/* SUMMARY */}
          <div
            className="stat-grid"
            style={{
              gridTemplateColumns:
                "repeat(2, 1fr)",
            }}
          >
            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  ⏳
                </div>
              </div>

              <b>
                {pendingSettlements.length}
              </b>

              <span>
                Pending Settlements
              </span>
            </div>

            <div className="stat-card">
              <div className="stat-card__top">
                <div className="stat-card__icon">
                  💰
                </div>
              </div>

              <b>
                {formatAmount(pendingAmount)}
              </b>

              <span>
                Amount To Be Settled
              </span>
            </div>
          </div>

          {/* SEARCH */}
          <div
            className="table-card"
            style={{
              marginTop: "24px",
              marginBottom: "24px",
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
                padding: "12px 14px",
                border:
                  "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* TABLE */}
          <div className="table-card">
            <div className="table-card__head">
              <h3
                style={{
                  fontFamily:
                    "var(--font-body)",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                }}
              >
                Pending Settlements
              </h3>

              <span>
                {filteredSettlements.length} pending
              </span>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                Loading settlements...
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                <p>{error}</p>

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={loadPayments}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Payment</th>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th>Owner</th>
                      <th>Ground</th>
                      <th>Amount</th>
                      <th>Paid At</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSettlements.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            textAlign:
                              "center",
                            padding: "40px",
                          }}
                        >
                          No pending settlements.
                        </td>
                      </tr>
                    ) : (
                      filteredSettlements.map(
                        (payment) => (
                          <tr
                            key={payment.id}
                          >
                            <td>
                              <b>
                                #{payment.id}
                              </b>
                            </td>

                            <td>
                              <b>
                                #
                                {
                                  payment.booking_id
                                }
                              </b>
                            </td>

                            <td>
                              {payment.customer_name ||
                                "-"}
                            </td>

                            <td>
                              {payment.owner_name ||
                                "-"}
                            </td>

                            <td>
                              {payment.ground_name ||
                                "-"}
                            </td>

                            <td>
                              <b>
                                {formatAmount(
                                  payment.amount
                                )}
                              </b>
                            </td>

                            <td>
                              {formatDateTime(
                                payment.paid_at
                              )}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn--outline btn--sm"
                                onClick={() =>
                                  openSettlement(
                                    payment
                                  )
                                }
                              >
                                Settle
                              </button>
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
        </div>
      </main>

      {/* SETTLEMENT MODAL */}
      {selectedPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeSettlement}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                  }}
                >
                  Settle Payment
                </h3>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#777",
                    fontSize: "13px",
                  }}
                >
                  Payment #
                  {selectedPayment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSettlement}
                style={{
                  border: "none",
                  background:
                    "transparent",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* PAYMENT INFO */}
            <div
              style={{
                border:
                  "1px solid #eee",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h4
                style={{
                  marginTop: 0,
                }}
              >
                Payment Details
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <small>Booking</small>
                  <br />
                  <b>
                    #
                    {
                      selectedPayment.booking_id
                    }
                  </b>
                </div>

                <div>
                  <small>Amount</small>
                  <br />
                  <b>
                    {formatAmount(
                      selectedPayment.amount
                    )}
                  </b>
                </div>

                <div>
                  <small>Customer</small>
                  <br />
                  <b>
                    {selectedPayment.customer_name ||
                      "-"}
                  </b>
                </div>

                <div>
                  <small>Owner</small>
                  <br />
                  <b>
                    {selectedPayment.owner_name ||
                      "-"}
                  </b>
                </div>

                <div>
                  <small>Ground</small>
                  <br />
                  <b>
                    {selectedPayment.ground_name ||
                      "-"}
                  </b>
                </div>

                <div>
                  <small>Paid At</small>
                  <br />
                  <b>
                    {formatDateTime(
                      selectedPayment.paid_at
                    )}
                  </b>
                </div>
              </div>
            </div>

            {/* OWNER PAYMENT DETAILS */}
            <div
              style={{
                border:
                  "1px solid #eee",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  marginTop: 0,
                }}
              >
                Owner Payment Details
              </h4>

              {loadingDetails ? (
                <p>
                  Loading owner payment
                  details...
                </p>
              ) : ownerPaymentDetails ? (
                <div
                  style={{
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      marginBottom:
                        "12px",
                    }}
                  >
                    <small>
                      Owner
                    </small>

                    <br />

                    <b>
                      {
                        selectedPayment.owner_name
                      }
                    </b>
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "12px",
                    }}
                  >
                    <small>
                      UPI ID
                    </small>

                    <br />

                    <b>
                      {ownerPaymentDetails.upi_id ||
                        ownerPaymentDetails.upiId ||
                        "Not provided"}
                    </b>
                  </div>

                  <div>
                    <small>
                      Payment Instructions
                    </small>

                    <br />

                    <span>
                      {ownerPaymentDetails.payment_instructions ||
                        ownerPaymentDetails.instructions ||
                        "No additional instructions."}
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    color: "#b3261e",
                    fontSize: "13px",
                  }}
                >
                  Owner payment details are
                  not available. Please update
                  the owner's payment details
                  before settlement.
                </p>
              )}
            </div>

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className="btn btn--ghost"
                onClick={closeSettlement}
                disabled={settling}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn--outline"
                disabled={
                  settling ||
                  loadingDetails ||
                  !ownerPaymentDetails
                }
                onClick={
                  handleSettlement
                }
              >
                {settling
                  ? "Settling..."
                  : "Mark as Settled"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettlements;