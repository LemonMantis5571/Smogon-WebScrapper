import express from "express";
import cors from "cors";
import smRoute from "./src/routes/sm.route.js";
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Initial route");
});

app.use(smRoute);

// the route we're working with

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
