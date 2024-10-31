import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userService from "../express-backend/services/user-service.js";

dotenv.config();

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose
  .connect(MONGO_CONNECTION_STRING)
  .catch((error) => console.log(error));

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(
    `Example app listening at http://localhost:${port}`
  );
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//get list of users
app.get("/users", (req, res) => {
  const name = req.query.name;
  const job = req.query.job;

  userService.getUsers(name, job)
  .then(users => {
    res.status(200).send({users_list: users});
  })
  .catch((error) => {
    res.status(500).send("Error fetching users.");
  });
});

//get specific user by id
app.get("/users/:id", (req, res) => {
  const id = req.params["id"];

  userService.findUserById(id)
  .then(user => {
    if (!user) {
      res.status(404).send("Resource not found")
    } else {
      res.send({user: user});
    }
  })
  .catch((error) => {
    res.status(500).send("Error fetching user by id.");
  });
});

//add user
app.post("/users", (req, res) => {
  const userToAdd = req.body;

  userService.addUser(userToAdd)
  .then(user => {
    res.status(201).send(user);
  })
  .catch((error) => {
    res.status(400).send("Failed to add user.");
  });
});

//delete user by ID
app.delete("/users/:id", (req, res) => {
  const id = req.params["id"];

  userService.deleteUser(id)
    .then(user => {
      if (!user) {
        res.status(404).send("Resource not found.");
      } else {
        res.status(204).send()
      }
    })
    .catch((error) => {
      res.status(500).send("Error deleting user.");
    });
});