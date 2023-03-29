require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();
require("./db");

const userRouter = require("./routes/user");
const { handleNotFound } = require("./utils/helper");
const { errorHandler } = require("./middlewares/error");
const { generatePhoneTransporter } = require("./utils/phone");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
io.on("connection", (client) => {
  client.on("greeting", (data) => {
    console.log(`greeting: ${data}`);
    client.emit("greeting", "Hello from server!");
  });
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);

app.use("/*", handleNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
