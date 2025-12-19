const express = require("express");
const router = require("./src/routes/api");
const app = new express();

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const aiRoute = require("./src/routes/aiRoute");

// --- DB ---
let URL =
    "mongodb+srv://rahatahmed537:rahat123@ecommerce.yqezajk.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Ecommerce";
let option = { user: "rahatahmed537", pass: "rahat123", autoIndex: true };
mongoose
    .connect(URL, option)
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));

// --- Core middleware ---
app.use(cookieParser());
app.use(cors());

// Helmet with relaxed CSP (allow external images like Unsplash)
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:", "https:", "*.unsplash.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", "https:"], // <--- simplified for prod
                objectSrc: ["'none'"],
            },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

app.set("etag", false);

// --- API routes ---
app.get("/api/v1/test", (req, res) => {
    res.json({ message: "API is working!" });
});
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1", router);

// --- Serve React build ---
const CLIENT_DIST = path.join(__dirname, "client", "dist"); // or "build" if CRA
app.use(express.static(CLIENT_DIST));

// Root ping (optional)
app.get("/", (req, res) => {
    res.send("Hello from root!");
});

// SPA fallback for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

module.exports = app;
