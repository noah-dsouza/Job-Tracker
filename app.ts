import express from "express";
import cors from "cors";
import routes from "./routes"; 

const app = express();

// Enable CORS so frontend calls backend
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Use defined routes
app.use("/api", routes);

export default app;
