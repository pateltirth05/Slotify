import express from "express"
import authRoutes from "./routes/authRoutes.js"
import groundRoutes from "./routes/groundRoutes.js"
const app=express()

app.use(express.json())

app.get("/health",(req,res)=>{
    res.send("Slotify API is running")
})

app.use("/api/auth",authRoutes)
app.use("/api/grounds",groundRoutes)
export default app;