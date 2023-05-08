const mongoose = require("mongoose");
const colors = require("colors");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(
      `MongoDB connected: ${con.connection.host}`.cyan.underline.bold
    );
  })
  .catch((ex) => {
    console.log("db connection failed: ", ex);
  });
