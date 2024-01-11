require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middleware/logger");
const PORT = 3500;
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const cors = require("cors");

console.log(process.env.NODE_ENV);

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));

app.use("/users", require("./routes/userRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      message: "404 Not Found",
    });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
