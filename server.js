import cookieParser from "cookie-parser";
import cors from "cors"
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import dbConnection from "./utils/index.js";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddleware.js";

import routes from "./routes/index.js";

dotenv.config()


// DB connection
dbConnection()


const port = process.env.PORT || 5000


const app = express()


app.use(
    cors({
    origin: ['http://localhost:3000' , "http://localhost:3001"], 
    method: ["GET" , "POST" , "PUT" , "DELETE" ],
    credentials: true,

    })
);



app.use(express.json())
app.use(express.urlencoded({extended: true }))

app.use(cookieParser())
app.use(morgan("dev"))
app.use("/api" , routes)  // http://localhost:8800/api

// middlewares
app.use(routeNotFound)
app.use(errorHandler)




app.listen(port , ()=>console.log(`server running on ${port}`))