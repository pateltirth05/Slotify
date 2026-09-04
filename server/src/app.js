import express from "express"
import authRoutes from "./routes/authRoutes.js"
import groundRoutes from "./routes/groundRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
import availabilityBlockRoutes from "./routes/availabilityBlockRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import ownerPaymentRoutes from "./routes/ownerPaymentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import ownerEarningsRoutes from "./routes/ownerEarningsRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import ownerGroundRoutes from "./routes/ownerGroundRoutes.js";
import cors from "cors"
const app=express()
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true
}));
app.use(express.json())

app.get("/health",(req,res)=>{
    res.send("Slotify API is running")
})

app.use("/api/auth",authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/grounds",groundRoutes)
app.use("/api/resources",resourceRoutes)
app.use("/api/bookings", bookingRoutes);
app.use(
  "/api/availability",
  availabilityRoutes
);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/availability-blocks", availabilityBlockRoutes);
app.use("/api/owner-payment", ownerPaymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerEarningsRoutes);
app.use("/api/owner/grounds", ownerGroundRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.message
        ? err.message
        : "Internal server error"
  });
});
export default app;