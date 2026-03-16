import express from 'express';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js';
import path from 'path';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
import cors from "cors";

const app = express();

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
app.use(express.json()); //req.body will be undefined without this middleware
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})); //allow cookies to be sent from frontend to backend
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

//make ready for deployment
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*",(_,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    });
}
    
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});