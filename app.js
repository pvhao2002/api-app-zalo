require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();
require("./db");

const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const { handleNotFound } = require("./utils/helper");
const { errorHandler } = require("./middlewares/error");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.use("/*", handleNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.blue.bold);
});

let users = [];
io.on("connection", (client) => {
  console.log("Client connected");
  client.on("register", (data) => {
    let result = false;
    if (users.indexOf(data) === -1) {
      users.push(data);
      client.un = data;
      result = true;
    }
    client.emit("result-register", { result });
  });

  client.on("send-message", (data) => {
    console.log(`Message from ${client.un}: ${data}`);

    // send all client
    io.emit("response-message", { message: client.un + ": " + data });
  });

  client.on("send-record", (data) => {
    console.log(data);
    io.emit("response-record", { message: data });
  });
});
