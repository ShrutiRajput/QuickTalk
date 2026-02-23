import express from 'express';
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);
    
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})