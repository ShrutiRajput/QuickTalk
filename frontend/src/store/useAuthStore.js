import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import {io} from "socket.io-client"; 

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000":"/";

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket:false,
  onlineUsers:[],
  isUpdatingProfile: false,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket(); //connect socket
    } catch (error) {
      console.log("Error in check Auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ authUser: response.data });
      toast.success("Account created successfully!");
      get().connectSocket(); //connect socket after signup
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ authUser: response.data });
      toast.success("Logged in sucesssfully");
      get().connectSocket(); //connect socket after login
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async()=>{
    try{
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out sucessfully");
      get().disconnectSocket();
    }catch(error){
      toast.error(error.response.data.message);
      console.log("Error in logout profile",error)
    }
  },
  updateProfile:async(data)=>{
    set({isUpdatingProfile:true})
    try{
      const response = await axiosInstance.put("/auth/update-profile",data)
      set({authUser:response.data})
      toast.success("User profile updated succesfully")
    }catch(error){
      toast.error(error.response.data.message);
      console.log("Error in update profile",error)
    }finally{
      set({isUpdatingProfile:false})
    }
  },
  connectSocket:async()=>{
    const {authUser} = get();
    if(!authUser || get().socket.connected)return;

    const socket = io(BASE_URL, {
      withCredentials:true //ensure cookies are sent with connection
    })

    socket.connect()

    set({socket});

    //listening for online users event
    socket.on("getOnlineUsers",(userIds)=>{
      set({onlineUsers: userIds})
    })

  },
  disconnectSocket:async()=>{
    if(get().socket.connected)get().socket.disconnect()
  }
}));
