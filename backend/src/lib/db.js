import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const {MONGO_URI} = process.env;
        if(!MONGO_URI){
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        const conn = await mongoose.connect(MONGO_URI);
        console.log("MONGODB Connected",conn.connection.host);
    }catch(error){
        console.error("Error Connected to MONGODB",error)
        process.exit(1); //1 status code means fail,0 means success
    }
};
