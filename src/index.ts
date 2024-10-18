import http, { IncomingMessage, ServerResponse } from "node:http";
import dotenv from "dotenv";
import { usersHandler } from "./users";

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    usersHandler(req, res);
  }
);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
