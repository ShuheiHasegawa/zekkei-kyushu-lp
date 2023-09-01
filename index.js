const express = require("express");
require('dotenv').config()
const env = process.env
const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://" + env.mongoUser + ":" + env.mongoPass + "@zekkeikyushu.tprym73.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");
    // Query for a movie that has the title 'The Room'
    const query = { title: "The Room" };
    // const query = { year: 1903 };
    // const query = {};
    const options = {
      // sort matched documents in descending order by rating
      sort: { "imdb.rating": -1 },
      // Include only the `title` and `imdb` fields in the returned document
      projection: { _id: 0, title: 1, imdb: 1 },
    };
    const movie = await movies.findOne(query, options);
    // since this method returns the matched document, not a cursor, print it directly
    console.log(movie);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


app.use("/public", express.static("public"));
app.use(express.static("link"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { mapId: env.mapId, mapKey: env.mapKey });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
