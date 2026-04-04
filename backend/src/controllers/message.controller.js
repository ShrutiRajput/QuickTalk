import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, getRecieverScoketId } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMessagesByUserId = async(req,res)=>{
  try{
    const myId = req.user._id;
    const {id:userToChatId} = req.params

    const messages = await Message.find({
      $or :[
        {senderId : myId, receiverId:userToChatId},
        {senderId : userToChatId, receiverId:myId},
      ]
    })
    res.status(200).json(messages)

  }catch(error){
    console.error("Error in getMessagesByUserId", error);
    res.status(500).json({error:"Internal Server error"});
  }
}

export const sendMessage = async(req,res)=>{
  try{
    const {text,image} = req.body;
    const senderId = req.user._id;
    const {id:receiverId} = req.params

    if(!text && !image){
      return res.status(400).json({error:"Message cannot be empty"})
    }
    if(senderId.equals(receiverId)){
      return res.status(400).json({error:"Cannot send message to yourself"})
    }
    const recieverExists = await User.exists({_id:receiverId});
    if(!recieverExists){
      return res.status(404).json({error:"Reciever not found"})
    }
    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      image: imageUrl,
      text
    })
    await newMessage.save();
    //todo: send messages in real time if user is online-socket.io
    const recievrSocketId = getRecieverScoketId(receiverId);
    if(recievrSocketId){
      io.to(recievrSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage)

  }catch(error){
    console.error("Error in sendMessage", error);
    res.status(500).json({error:"Internal Server error"});
  }
}
export const getChatPartners = async(req,res)=>{
  try{
    const loggedInUserId = req.user._id;
    //find all the messages where the logged-in user is either sender or reciever
    const messages = await Message.find({
      $or :[{senderId :loggedInUserId},{receiverId:loggedInUserId} ]
    })

    const chatPartnerIds = [...new Set(messages.map(msg => msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() :msg.senderId.toString()))]
    const chatPartner = await User.find({_id:{$in:chatPartnerIds}}).select("-password");
    res.status(200).json(chatPartner)

  }catch(error){
    console.error("Error in getChatPartners", error);
    res.status(500).json({error:"Internal Server error"});
  }
}