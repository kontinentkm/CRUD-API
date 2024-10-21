import request from "supertest";
import http from "node:http";
import { usersHandler } from "./users";

const createServer = () => {
  const server = http.createServer(usersHandler);
  return server.listen(4000);
};

describe("Users API", () => {
  let server: http.Server;

  beforeEach(() => {
    server = createServer();
  });

  afterEach((done) => {
    server.close(done);
  });

  it("should return an empty array when getting all users", async () => {
    const res = await request(server).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should create a new user with a POST request", async () => {
    const newUser = {
      username: "john_doe",
      age: 25,
      hobbies: ["reading", "swimming"],
    };

    const res = await request(server).post("/api/users").send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toBe(newUser.username);
    expect(res.body.age).toBe(newUser.age);
    expect(res.body.hobbies).toEqual(newUser.hobbies);
  });

  it("should get a user by ID with a GET request", async () => {
    const newUser = {
      username: "john_doe",
      age: 25,
      hobbies: ["reading", "swimming"],
    };
    const createRes = await request(server).post("/api/users").send(newUser);
    const createdUser = createRes.body;

    const res = await request(server).get(`/api/users/${createdUser.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(createdUser);
  });

  it("should update an existing user with a PUT request", async () => {
    const newUser = {
      username: "john_doe",
      age: 25,
      hobbies: ["reading", "swimming"],
    };
    const createRes = await request(server).post("/api/users").send(newUser);
    const createdUser = createRes.body;

    const updatedUser = {
      username: "jane_doe",
      age: 28,
      hobbies: ["reading", "dancing"],
    };
    const res = await request(server)
      .put(`/api/users/${createdUser.id}`)
      .send(updatedUser);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(updatedUser.username);
    expect(res.body.age).toBe(updatedUser.age);
    expect(res.body.hobbies).toEqual(updatedUser.hobbies);
  });

  it("should delete a user with a DELETE request", async () => {
    const newUser = {
      username: "john_doe",
      age: 25,
      hobbies: ["reading", "swimming"],
    };
    const createRes = await request(server).post("/api/users").send(newUser);
    const createdUser = createRes.body;

    const deleteRes = await request(server).delete(
      `/api/users/${createdUser.id}`
    );
    expect(deleteRes.status).toBe(204);

    const getRes = await request(server).get(`/api/users/${createdUser.id}`);
    expect(getRes.status).toBe(404);
    expect(getRes.body.message).toBe("User not found");
  });
});
