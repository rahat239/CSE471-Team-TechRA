import create from 'zustand';
import axios from "axios";
import { getEmail, setEmail, unauthorized } from "../utility/utility.js";
import Cookies from "js-cookie";

const UserStore = create((set) => ({
    // Check if the User is logged in by checking the presence of token in localStorage
    isLogin: () => {
        const token = localStorage.getItem('token');
        console.log("Checking if User is logged in: Token found -", token); // Debugging token check
        return !!token;
    },

    LoginFormData: { email: "" },
    LoginFormOnChange: (name, value) => {
        set((state) => ({
            LoginFormData: {
                ...state.LoginFormData,
                [name]: value
            }
        }));
    },

    // Request OTP for User email
    UserOTPRequest: async (email) => {
        console.log("OTP Request initiated for email:", email); // Debugging OTP request
        set({ isFormSubmit: true });
        let res = await axios.get(`/api/v1/UserOTP/${email}`);
        console.log("OTP Request Response:", res); // Debugging OTP response
        setEmail(email);
        set({ isFormSubmit: false });
        return res.data['status'] === "success";
    },

    // Log out the User
    UserLogoutRequest: async () => {
        console.log("User logout initiated."); // Debugging logout
        set({ isFormSubmit: true });
        let res = await axios.get(`/api/v1/UserLogout`);
        set({ isFormSubmit: false });
        console.log("Logout response:", res);
        return res.data['status'] === "success";
    },

    OTPFormData: { otp: "" },
    OTPFormOnChange: (name, value) => {
        set((state) => ({
            OTPFormData: {
                ...state.OTPFormData,
                [name]: value
            }
        }));
    },

    // Verify login and store token in localStorage
    VerifyLoginRequest: async (otp) => {
        set({ isFormSubmit: true });
        let email = getEmail();
        console.log("Verifying OTP for email:", email); // Debugging email before OTP verification
        let res = await axios.get(`/api/v1/VerifyLogin/${email}/${otp}`);
        set({ isFormSubmit: false });

        if (res.data['status'] === "success") {
            // Store the token in localStorage after successful login
            console.log('Token received:', res.data.token);
            localStorage.setItem('token', res.data.token);
            console.log('Token saved in localStorage:', res.data.token); // Debugging token saving
        }
        return res.data['status'] === "success";
    },

    isFormSubmit: false,

    // Profile Management
    ProfileForm: {
        cus_add: "", cus_city: "", cus_country: "", cus_fax: "", cus_name: "", cus_phone: "", cus_postcode: "", cus_state: "",
        ship_add: "", ship_city: "", ship_country: "", ship_name: "", ship_phone: "", ship_postcode: "", ship_state: ""
    },
    ProfileFormChange: (name, value) => {
        set((state) => ({
            ProfileForm: {
                ...state.ProfileForm,
                [name]: value
            }
        }));
    },

    ProfileDetails: null,
    ProfileDetailsRequest: async () => {
        try {
            let res = await axios.get(`/api/v1/ReadProfile`);
            if (res.data['data'].length > 0) {
                set({ ProfileDetails: res.data['data'][0] });
                set({ ProfileForm: res.data['data'][0] });
            } else {
                set({ ProfileDetails: [] });
            }
        } catch (e) {
            unauthorized(e.response.status);
        }
    },

    ProfileSaveRequest: async (PostBody) => {
        try {
            set({ ProfileDetails: null });
            let res = await axios.post(`/api/v1/UpdateProfile`, PostBody);
            return res.data['status'] === "success";
        } catch (e) {
            unauthorized(e.response.status);
        }
    }

}));

export default UserStore;
