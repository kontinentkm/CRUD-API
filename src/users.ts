//users.ts
import { IncomingMessage, ServerResponse } from "node:http";
import { parse } from "node:url";
import { v4 as uuidv4 } from "uuid";

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

let users: User[] = [];

const sendResponse = (
  res: ServerResponse,
  statusCode: number,
  data: object
) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const usersHandler = (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { method, url } = req;
    const parsedUrl = parse(url || "", true);
    const path = parsedUrl.pathname?.split("/").filter(Boolean);

    // GET
    if (method === "GET" && path?.[0] === "api" && path?.[1] === "users") {
      if (path.length === 2) {
        sendResponse(res, 200, users);
      } else if (path.length === 3) {
        const userId = path[2];
        if (!isValidUUID(userId)) {
          sendResponse(res, 400, { message: "Invalid userId" });
        } else {
          const user = users.find((u) => u.id === userId);
          if (!user) {
            sendResponse(res, 404, { message: "User not found" });
          } else {
            sendResponse(res, 200, user);
          }
        }
      }
    }

    // POST
    else if (
      method === "POST" &&
      path?.[0] === "api" &&
      path?.[1] === "users"
    ) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        if (!body) {
          sendResponse(res, 400, { message: "Empty body" });
          return;
        }

        try {
          const { username, age, hobbies } = JSON.parse(body);

          if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
            sendResponse(res, 400, { message: "Missing required fields" });
          } else {
            const newUser: User = { id: uuidv4(), username, age, hobbies };
            users.push(newUser);
            sendResponse(res, 201, newUser);
          }
        } catch (error) {
          sendResponse(res, 400, { message: "Invalid JSON" });
        }
      });
    }

    // PUT
    else if (
      method === "PUT" &&
      path?.[0] === "api" &&
      path?.[1] === "users" &&
      path.length === 3
    ) {
      const userId = path[2];
      if (!isValidUUID(userId)) {
        sendResponse(res, 400, { message: "Invalid userId" });
      } else {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          if (!body) {
            sendResponse(res, 400, { message: "Request body is empty" });
            return;
          }

          let parsedBody;
          try {
            parsedBody = JSON.parse(body);
          } catch (error) {
            sendResponse(res, 400, { message: "Invalid JSON format" });
            return;
          }

          const { username, age, hobbies } = parsedBody;
          const userIndex = users.findIndex((u) => u.id === userId);

          if (userIndex === -1) {
            sendResponse(res, 404, { message: "User not found" });
          } else {
            if (username !== undefined) users[userIndex].username = username;
            if (age !== undefined) users[userIndex].age = age;
            if (hobbies !== undefined) users[userIndex].hobbies = hobbies;
            sendResponse(res, 200, users[userIndex]);
          }
        });
      }
    }

    // DELETE
    else if (
      method === "DELETE" &&
      path?.[0] === "api" &&
      path?.[1] === "users" &&
      path.length === 3
    ) {
      const userId = path[2];
      if (!isValidUUID(userId)) {
        sendResponse(res, 400, { message: "Invalid userId" });
      } else {
        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex === -1) {
          sendResponse(res, 404, { message: "User not found" });
        } else {
          users.splice(userIndex, 1);
          sendResponse(res, 204, {});
        }
      }
    } else {
      sendResponse(res, 404, { message: "Route not found" });
    }
  } catch (error) {
    sendResponse(res, 500, { message: "Internal Server Error" });
  }
};
