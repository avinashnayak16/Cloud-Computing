const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("views"));

mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://avinash:1143@cluster0.okj67yp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const User = require("./models/User");
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.get("/", (req, res) => res.sendFile(__dirname + "/views/login.html"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
