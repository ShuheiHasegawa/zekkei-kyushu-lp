import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import { S3Client } from "@aws-sdk/client-s3";

const env = process.env;
const app = express();
const uri =
  "mongodb+srv://" +
  env.mongoUser +
  ":" +
  env.mongoPass +
  "@zekkeikyushu.tprym73.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// mongoDBサンプルデータ挿入
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

// AWSの設定
const s3 = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

// S3の設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// TODO: 要修正
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

/**
 * S3にアップロードする
 */
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    // acl: 'public-read',
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, callBack) => {
      callBack(null, { fieldName: file.fieldname });
    },
    key: (req, file, callBack) => {
      var fullPath = "public/" + file.originalname; //If you want to save into a folder concat de name of the folder to the path
      callBack(null, fullPath);
    },
  }),
  // limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  // fileFilter: function (req, file, cb) {
  //     checkFileType(file, cb);
  // }
}).array("field_files", 2);
// .single('フォーム上のnameパラメータ');

app.use("/public", express.static("public"));
app.use(express.static("link"));
app.set("view engine", "ejs");

/**
 * 初期表示画面
 */
app.get("/", (req, res) => {
  res.render("index", { mapId: env.mapId, mapKey: env.mapKey });
});

/**
 * 画像アップロード画面
 */
app.get("/uploads", (req, res) => {
  res.render("uploads", { mapId: env.mapId, mapKey: env.mapKey });
});

/**
 * 画像アップロード保存処理
 */
app.post("/uploads", (req, res, next) => {
  uploadToS3(req, res, (error) => {
    if (error) {
      console.log("errors", error);
      res.json({ error: error });
    } else {
      // If File not found
      if (req.file === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success
        const imageName = req.file.key;
        const imageLocation = req.file.location;
        // Save the file name into database into profile model
        res.json({
          image: imageName,
          location: imageLocation,
        });
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
