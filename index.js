const app = require("./app");

const PORT = process.env.PORT || 5030; // use Render's port if provided

app.listen(PORT, "0.0.0.0", () => {
    console.log(`App running on port ${PORT}`);
});
