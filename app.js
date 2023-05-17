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

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(`${userData._id}`);
    console.log(`User: ${userData.name} join ${userData._id}`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(`${room}`);
    console.log("User Joined Room: " + room);
  });

  socket.on("new message", (message) => {
    let chat = message.chat;
    io.in(chat._id).emit("message received", message);
  });

  socket.on("typing", (room) => socket.in(`${room}`).emit("typing"));
  socket.on("stop typing", (room) => socket.in(`${room}`).emit("stop typing"));

  // socket.on("new message", (message) => {
  //   let chat = message.chat;

  //   if (!chat.users) return console.log("chat.users not defined");

  //   chat.users.forEach((user) => {
  //     if (user._id == message.sender._id) return;
  //     console.log(`Send message: ${message.content} to room ${user._id}`);
  //     socket.in(`${user._id}`).emit("message recieved", message);
  //   });
  // });

  socket.on("leave chat", (chatId) => {
    console.log("USER DISCONNECTED");
    socket.leave(`${chatId}`);
  });
});
