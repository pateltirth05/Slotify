import { useEffect, useState } from "react";
import api from "../../services/api";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import "../../style/owner.css"
import "../../style/admin.css"
import "../../style/style.css"
function OwnerPaymentDetails() {
  const [formData, setFormData] = useState({
    upiId: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/owner-payment");

        const details = response.data.paymentDetails;

        setFormData({
          upiId: details?.upi_id || "",
          instructions: details?.payment_instructions || "",
        });
      } catch (error) {
        console.error(
          "Failed to fetch payment details:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load payment details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await api.put("/owner-payment", {
        upi_id: formData.upiId,
        payment_instructions: formData.instructions,
      });

      setMessage("Payment details saved successfully.");
    } catch (error) {
      console.error(
        "Failed to save payment details:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save payment details"
      );
    } finally {
      setSaving(false);
    }
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

          <h2>Payment Details</h2>
        </div>

        <div
          className="admin-body"
          style={{ maxWidth: "560px" }}
        >
          <p
            style={{
              color: "var(--c-ink-soft)",
              fontSize: ".9rem",
              marginBottom: "20px",
            }}
          >
            These details are used for owner settlement
            information.
          </p>

          {loading ? (
            <p>Loading payment details...</p>
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="upi">
                    UPI ID
                  </label>

                  <input
                    type="text"
                    id="upi"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="yourname@bank"
                  />
                </div>

                <div className="field">
                  <label htmlFor="instructions">
                    Payment Instructions
                  </label>

                  <textarea
                    id="instructions"
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Enter payment instructions"
                  />
                </div>

                {error && (
                  <p
                    style={{
                      color: "var(--c-danger)",
                      fontSize: ".9rem",
                      marginBottom: "15px",
                    }}
                  >
                    {error}
                  </p>
                )}

                {message && (
                  <p
                    style={{
                      color: "var(--c-success)",
                      fontSize: ".9rem",
                      marginBottom: "15px",
                    }}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OwnerPaymentDetails;