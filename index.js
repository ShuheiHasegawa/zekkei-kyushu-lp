const express = require("express");
require('dotenv').config()

const env = process.env
console.log(env.mapId)
console.log(env.mapKey)

const app = express();
app.use("/public", express.static("public"));
app.use(express.static("link"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { mapId: env.mapId, mapKey: env.mapKey });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
