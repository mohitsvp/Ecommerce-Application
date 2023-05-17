//  Importing all packages
const express = require("express");
const connect = require("./src/config/db");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const morgan = require("morgan");
// Controller routes
const userRoute = require("./src/routes/user.route");
const productRoute = require("./src/routes/product.route");
const { notFound, errorHandler } = require("./src/middlewares/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);


// Error handling
app.use(notFound);
app.use(errorHandler);

// Starting server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  try {
    connect();
    console.log(`Listening on ${PORT}`);
  } catch (error) {
    console.log({ message: error.message });
  }
});
