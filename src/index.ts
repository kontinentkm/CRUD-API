//index.ts
import http, { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import { usersHandler } from "./users";

dotenv.config();

const PORT = process.env.PORT || 4000;

console.log(`Worker is listening on port ${PORT}`);

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log(`Request received on port ${PORT}`);
    usersHandler(req, res);
  }
);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  console.error(`Error occurred on server listening on port ${PORT}:`, err);
});

process.on("exit", (code) => {
  console.log(`Worker process is exiting with code ${code}`);
});

setInterval(() => {
  console.log("Worker still alive...");
}, 5000);
