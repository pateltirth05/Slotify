import app from "./app.js";
import dotenv from "dotenv"
 import pool from "./config/db.js";
dotenv.config()
const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`)
})
// const result = await pool.query(`
//   SELECT current_database(), current_schema();
// `);

// console.log(result.rows[0]);
// pool.query("SELECT NOW()",(error,result)=>{
//     if (error) {
//     console.error("Database connection failed:", error);
//   } else {
//     console.log("Database connected:", result.rows[0]);
//   }  

// })