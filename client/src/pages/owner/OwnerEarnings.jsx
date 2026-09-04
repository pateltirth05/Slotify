import { useEffect, useState } from "react";
import api from "../../services/api";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerEarnings() {
  const [payments, setPayments] = useState([]);
  const [earnings, setEarnings] = useState({
    total_revenue: 0,
    pending_settlement: 0,
    settled_amount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const paymentsPerPage = 5;

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError("");

        const [paymentsResponse, earningsResponse] =
          await Promise.all([
            api.get("/owner/payments"),
            api.get("/owner/earnings"),
          ]);

        setPayments(
          paymentsResponse.data.payments || []
        );

        setEarnings(
          earningsResponse.data.earnings || {
            total_revenue: 0,
            pending_settlement: 0,
            settled_amount: 0,
          }
        );
      } catch (error) {
        console.error("Failed to fetch earnings:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load earnings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const dateString = String(date).slice(0, 10);

    const [year, month, day] =
      dateString.split("-");

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

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "PAID":
        return "badge badge--paid";

      case "UNPAID":
        return "badge badge--unpaid";

      case "FAILED":
        return "badge badge--cancelled";

      default:
        return "badge";
    }
  };

  const getSettlementStatusClass = (status) => {
    switch (status) {
      case "SETTLED":
        return "badge badge--settled";

      case "PENDING":
        return "badge badge--settle-pending";

      default:
        return "";
    }
  };

  /*
   * Pagination
   */
  const totalPages = Math.ceil(
    payments.length / paymentsPerPage
  );

  const startIndex =
    (currentPage - 1) * paymentsPerPage;

  const currentPayments = payments.slice(
    startIndex,
    startIndex + paymentsPerPage
  );

  const startNumber =
    payments.length === 0 ? 0 : startIndex + 1;

  const endNumber = Math.min(
    startIndex + paymentsPerPage,
    payments.length
  );

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
        {/* TOPBAR */}
        <div className="admin-topbar">
          <button
            type="button"
            className="hamburger-btn"
          >
            ☰
          </button>

          <h2>Earnings</h2>
        </div>

        <div className="admin-body">
          {loading ? (
            <p>Loading earnings...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {/* STAT CARDS */}
              <div
                className="stat-grid"
                style={{
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                }}
              >
                <div className="stat-card">
                  <div className="stat-card__top">
                    <div className="stat-card__icon">
                      💰
                    </div>
                  </div>

                  <b>
                    {formatAmount(
                      earnings.total_revenue
                    )}
                  </b>

                  <span>Total Revenue</span>
                </div>

                <div className="stat-card">
                  <div className="stat-card__top">
                    <div className="stat-card__icon">
                      ⏳
                    </div>
                  </div>

                  <b>
                    {formatAmount(
                      earnings.pending_settlement
                    )}
                  </b>

                  <span>Pending Settlement</span>
                </div>

                <div className="stat-card">
                  <div className="stat-card__top">
                    <div className="stat-card__icon">
                      ✅
                    </div>
                  </div>

                  <b>
                    {formatAmount(
                      earnings.settled_amount
                    )}
                  </b>

                  <span>Settled Amount</span>
                </div>
              </div>

              {/* PAYMENT HISTORY */}
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
                    Payment History
                  </h3>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Payment Status</th>
                      <th>Settlement Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentPayments.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          No payment history found.
                        </td>
                      </tr>
                    ) : (
                      currentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <b>
                              #{payment.booking_id}
                            </b>
                          </td>

                          <td>
                            {payment.customer_name ||
                              "-"}
                          </td>

                          <td>
                            {formatAmount(
                              payment.amount
                            )}
                          </td>

                          <td>
                            {payment.payment_method ||
                              "-"}
                          </td>

                          <td>
                            <span
                              className={getPaymentStatusClass(
                                payment.status
                              )}
                            >
                              {payment.status ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            {payment.payment_method ===
                            "CASH" ? (
                              "—"
                            ) : (
                              <span
                                className={getSettlementStatusClass(
                                  payment.settlement_status
                                )}
                              >
                                {payment.settlement_status ||
                                  "-"}
                              </span>
                            )}
                          </td>

                          <td>
                            {formatDate(
                              payment.created_at
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* FOOTER */}
                <div className="table-foot">
                  <span>
                    Showing {startNumber}–{endNumber} of{" "}
                    {payments.length} payments
                  </span>

                  {totalPages > 0 && (
                    <div className="pagination">
                      <button
                        type="button"
                        onClick={() =>
                          goToPage(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                      >
                        ‹
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          type="button"
                          key={page}
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
                          goToPage(currentPage + 1)
                        }
                        disabled={
                          currentPage === totalPages
                        }
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerEarnings;