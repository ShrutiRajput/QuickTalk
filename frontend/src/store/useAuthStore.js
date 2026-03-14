import { create } from "zustand";

export const useAuthStore = create((set)=> ({
    authUser : {name:"Shruti", age:23, _id:1},
    isLoggedIn:false,
    login : ()=>{
        set({isLoggedIn:true})
    }
}))