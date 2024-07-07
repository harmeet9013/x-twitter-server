import Express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connect } from "mongoose";
import "dotenv/config";

import createError from "http-errors";
import usersRoutes from "./routes/users-routes.js";

const PORT = process.env.PORT || 5000;
const app = Express();

app.use(bodyParser.json());

app.use(
    cors({
        origin: ["https://localhost:5173"],
    })
);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    return next(createError(404, "Route not found!"));
});

app.use((err, req, res, next) => {
    res.status(err.statusCode).json({
        message: err.message,
    });
});

connect(process.env.DB_URL)
    .then(() => {
        app.listen(PORT);
        console.log("Connected to database. Port ::", PORT);
    })
    .catch((error) => {
        console.log("Error ::", error);
    });

export default app;
