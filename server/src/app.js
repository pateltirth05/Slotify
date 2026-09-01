import express from "express"
import authRoutes from "./routes/authRoutes.js"
import groundRoutes from "./routes/groundRoutes.js"
import resourceRoutes from "./routes/resourceRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
const app=express()

app.use(express.json())

app.get("/health",(req,res)=>{
    res.send("Slotify API is running")
})

app.use("/api/auth",authRoutes)
app.use("/api/grounds",groundRoutes)
app.use("/api/resources",resourceRoutes)
app.use("/api/bookings", bookingRoutes);
export default app;