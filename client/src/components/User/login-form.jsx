import React from 'react';
import UserSubmitButton from "./UserSubmitButton.jsx";
import UserStore from "../../store/UserStore.js";
import ValidationHelper from "../../utility/ValidationHelper.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    let navigate = useNavigate();
    let { LoginFormData, LoginFormOnChange, UserOTPRequest } = UserStore();

    const onFormSubmit = async () => {
        if (!LoginFormData.email) {
            toast.error("Email Address is required.");
            return;
        }

        if (!ValidationHelper.IsEmail(LoginFormData.email)) {
            toast.error("Valid Email Address Required");
            return;
        }

        try {
            let res = await UserOTPRequest(LoginFormData.email);  // Request OTP

            if (res) {
                // After OTP request is successful, navigate to the OTP page
                navigate("/otp");
            } else {
                toast.error("Something Went Wrong !");
            }
        } catch (error) {
            toast.error("Error occurred while requesting OTP.");
        }
    };

    return (
        <div className="container section">
            <div className="row d-flex justify-content-center">
                <div className="col-md-5">
                    <div className="card p-5">
                        <h4>Enter Your Email</h4>
                        <p>A verification code will be sent to the email address you provide</p>
                        <input
                            value={LoginFormData.email}
                            onChange={(e) => {
                                LoginFormOnChange("email", e.target.value);
                            }}
                            placeholder="Email Address"
                            type="email"
                            className="form-control"
                        />
                        <UserSubmitButton onClick={onFormSubmit} className="btn mt-3 btn-success" text="Next" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

