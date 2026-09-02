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
const app=express()

app.use(express.json())

app.get("/health",(req,res)=>{
    res.send("Slotify API is running")
})

app.use("/api/auth",authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/grounds",groundRoutes)
app.use("/api/resources",resourceRoutes)
app.use("/api/bookings", bookingRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/availability-blocks", availabilityBlockRoutes);
app.use("/api/owner-payment", ownerPaymentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerEarningsRoutes);
export default app;