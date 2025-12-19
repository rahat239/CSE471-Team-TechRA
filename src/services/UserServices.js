// services/UserServices.js
const EmailSend = require("../utility/EmailHelper");
const UserModel  = require("../models/UserModel");
const ProfileModel = require("../models/ProfileModel");
const { EncodeToken } = require("../utility/TokenHelper");

// DEBUG
const dbg = (...a) => console.debug('[DEBUG][UserServices]', ...a);

// ---------- OTP SEND ----------
const UserOTPService = async (req) => {
    try {
        const rawEmail = String(req.params.email || req.body.email || '');
        const email = rawEmail.trim().toLowerCase();

        const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // keep as STRING
        const EmailText = `Your Verification Code is: ${code}`;
        const EmailSubject = 'Email Verification';

        await EmailSend(email, EmailText, EmailSubject);

        await UserModel.updateOne(
            { email },
            { $set: { email, otp: code, otpIssuedAt: new Date() } },
            { upsert: true }
        );

        dbg('OTP SENT', { email, code });
        return { status: "success", message: "6 Digit OTP has been sent" };
    } catch (e) {
        dbg('OTP ERROR', e);
        return { status: "fail", message: e?.message || 'OTP send failed' };
    }
};

// ---------- OTP VERIFY (ATOMIC) ----------
// services/UserServices.js
const VerifyOTPService = async (req) => {
    try {
        const rawEmail = String(req.params.email || req.body.email || '');
        const email = rawEmail.trim().toLowerCase();
        const otpIn  = String(req.params.otp || req.body.otp || '').trim().replace(/\D/g,'');

        // optional expiry: 10 minutes window
        const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);

        // Atomically match & consume OTP
        const doc = await UserModel.findOneAndUpdate(
            {
                email,
                otp: otpIn,
                $or: [ { otpIssuedAt: { $exists: false } }, { otpIssuedAt: { $gte: tenMinAgo } } ]
            },
            { $set: { otp: "0", lastLoginAt: new Date() } },   // consume OTP
            { new: true, projection: { _id: 1, email: 1 }, lean: true }
        );

        dbg('VERIFY ATOMIC', { email, otpIn, matched: !!doc });

        if (!doc) return { status: "fail", message: "Invalid OTP", total: 0 };

        // Check if the User is admin
        const role = email === 'rahatahmed537@gmail.com' ? 'admin' : 'user';  // Assign role for admin

        // Issue token with role
        const token = EncodeToken(email, doc._id.toString(), role);

        return { status: "success", message: "Valid OTP", token, total: 1 };
    } catch (e) {
        dbg('VERIFY ERROR', e);
        return { status: "fail", message: "Invalid OTP" };
    }
};


// ---------- PROFILE ----------
const SaveProfileService = async (req) => {
    try {
        const user_id = req.headers.user_id;
        const reqBody = { ...req.body, userID: user_id };
        await ProfileModel.updateOne({ userID: user_id }, { $set: reqBody }, { upsert: true });
        return { status: "success", message: "Profile Save Success" };
    } catch (e) {
        return { status: "fail", message: "Something Went Wrong" };
    }
};

const ReadProfileService = async (req) => {
    try {
        const user_id = req.headers.user_id;
        const result = await ProfileModel.find({ userID: user_id });
        return { status: "success", data: result };
    } catch (e) {
        return { status: "fail", message: "Something Went Wrong" };
    }
};

module.exports = {
    UserOTPService,
    VerifyOTPService,
    SaveProfileService,
    ReadProfileService
};
