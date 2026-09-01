import express from "express"
import authRoutes from "./routes/authRoutes.js"
import groundRoutes from "./routes/groundRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
const app=express()

app.use(express.json())

app.get("/health",(req,res)=>{
    res.send("Slotify API is running")
})

app.use("/api/auth",authRoutes)
app.use("/api/grounds",groundRoutes)
app.use("/api/resources",resourceRoutes)
app.use("/api/bookings", bookingRoutes);

app.use("/api/dashboard", dashboardRoutes);
export default app;