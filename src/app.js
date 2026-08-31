require("dotenv").config();
const express = require("express");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(morgan("dev"));
//Agregue esto para que express pueda leer los datos que son enviados y procesarlos. 
app.use(express.json());

//error en el login, tenia doble N 
app.use("/api/login", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Operacion Rescate II"
  });
});

app.use(errorHandler);

module.exports = app;
