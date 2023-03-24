require("express-async-errors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config({ path: ".env" });
require("./db");

const userRouter = require("./routes/user");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("the port is listening on port " + PORT);
});
