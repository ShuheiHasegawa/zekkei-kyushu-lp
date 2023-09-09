import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import { S3Client } from "@aws-sdk/client-s3";
import bodyParser from "body-parser";

const env = process.env;
const app = express();
const mongoUri =
  "mongodb+srv://" +
  env.mongoUser +
  ":" +
  env.mongoPass +
  "@zekkeikyushu.tprym73.mongodb.net/?retryWrites=true&w=majority";

const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * mongoDBからユーザーIDに紐づくファイルデータを取得する
 */
async function findUploadFiles(userId) {
  try {
    const database = mongoClient.db("zekkei_kyushu");
    const uploadFiles = database.collection("upload_files");
    const query = { userId: userId };
    const options = {
      // sort: { title: 1 },
      projection: { _id: 0, fileName: 1, url: 1 },
    };
    const records = uploadFiles.find(query, options);
    if ((await uploadFiles.countDocuments(query)) === 0) {
      console.log("No documents found!");
    }

    let data = [];
    for await (const record of records) {
      console.dir(record);
      data.push(record);
    }

    return data;

  } finally {
    await mongoClient.close();
  }
}

/**
 * mongoDBにファイルデータを挿入する
 * @param {*} file
 * @param {*} exifData
 * @returns
 */
async function insertUploadFiles(file, exifData) {
  try {
    const database = mongoClient.db("zekkei_kyushu");
    const uploadFiles = database.collection("upload_files");

    let query = JSON.parse(exifData)
    query.userId = "1";
    query.fileName = file.originalname;
    query.url = file.location;
    // const query = {
    //   userId: "1",
    //   fileName: file.originalname,
    //   url: file.location,
    // };

    const result = await uploadFiles.insertOne(query);

  } finally {
    await mongoClient.close();
  }
}
// run().catch(console.dir);

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
      let fullPath = "public/" + file.originalname; //If you want to save into a folder concat de name of the folder to the path
      callBack(null, fullPath);
    },
  }),
  // limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  // fileFilter: function (req, file, cb) {
  //     checkFileType(file, cb);
  // }
}).array("field_files", 4);
// .single('フォーム上のnameパラメータ', '最大ファイル数'));

app.use("/public", express.static("public"));
app.use(express.static("link"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))

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

  findUploadFiles("1").catch(console.dir).then((records) => {
    res.render("uploads", { mapId: env.mapId, mapKey: env.mapKey, records: records });
  });

  // res.render("uploads", { mapId: env.mapId, mapKey: env.mapKey });
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
      if (req.files === undefined) {
        console.log("Error: No File Selected!");
        res.json("Error: No File Selected");
      } else {
        // If Success
        req.files.forEach(function (file, index) {
          insertUploadFiles(file, req.body.field_files_exif[index]);
        });

        res.json({
          files: req.files
        });
      }
    }
  });
});

/**
 * ギャラリー画面
 */
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
