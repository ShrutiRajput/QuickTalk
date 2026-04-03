import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set,get)=>({
    allContacts:[],
    chats:[],
    messages:[],
    activeTab:"chats",
    selectedUser:null,
    isUserLoading:false,
    isMessagesLoading:false,
    isSoundEnabled:JSON.parse(localStorage.getItem("isSoundEnabled"))=== true,
    toggleSound:()=>{
        localStorage.setItem("isSoundEnabled",!get().isSoundEnabled)
        set({isSoundEnabled:!get().isSoundEnabled})
    },
    setActiveTab:(tab)=>{
        set({activeTab:tab})
    },
    setSelectedUser:(user)=>{
        set({selectedUser:user})
    },
    getAllContacts:async()=>{
        set({isUserLoading:true})
        try{
            const response = await axiosInstance.get("/messages/contacts")
            set({allContacts:response.data})
        }catch(error){
            toast.error("Failed to load contacts")
            console.log(error.response.data.message)
        }finally{
            set({isUserLoading:false})
        }
    },
    getMyChatPartners:async()=>{
        try{
            set({isUserLoading:true})
            const response = await axiosInstance.get("/messages/chats")
            set({chats:response.data})
        }catch(error){
            toast.error(error?.response?.data?.message || "Failed to load chat partners")
        }finally{
            set({isUserLoading:false})
        }
    },
    getMessagesByUserId:async(userId)=>{
        set({isMessagesLoading:true})
        try{
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages:response.data})
        }catch(error){
            toast.error(error?.response?.data?.message || "Failed to load messages")
        }finally{
           set({isMessagesLoading:false})
        }
    },
    sendMessage:async(messageData)=>{
        const {selectedUser, messages} = get();
        const {authUser} = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`
        const optimisticMessage = {
            _id:tempId,
            senderId:authUser._id,
            recieverId:selectedUser._id,
            text:messageData.text,
            image:messageData.image,
            createdAt:new Date().toISOString(),
            isOptimistic:true, // flag to identify optimistic message(optional)
        }
        //immediately update the UI by adding the message 
        set({messages: [...messages,optimisticMessage]})
        try{
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData)
            set({messages: messages.concat(response.data)})

        }catch(error){
            //remove optimistic message on failure
            set({messages: messages})
            toast.error(error?.response?.data?.message || "Something went wrong");
            console.log("Error in Send Message",error)
        } 
    },
    subscribeToMessages:()=>{
        const {selectedUser, isSoundEnabled} = get();
        if(!selectedUser)return;

        const {socket} = useAuthStore.getState();
        socket.on("newMessage",(newMessage)=>{
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            
            const currentMessage = get().messages;
            set({messages: [...currentMessage, newMessage]});

            if(isSoundEnabled){
                const notificationSound = new Audio("/sounds/notification.mp3");
                notificationSound.currentTime = 0; //reset to start 
                notificationSound.play().catch((e)=> console.log("Audio play failed:",e) )
            }
        })

    },
    unsubscribeFromMessages:()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },
}))
    