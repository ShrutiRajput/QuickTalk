import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

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
            toast.error("Failed to load chat partners")
            console.log(error.response.data.message)
        }finally{
            set({isUserLoading:false})
        }
    }


}))
    