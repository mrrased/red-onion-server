const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const sharp = require('sharp');
const multer  = require('multer');
const fileUpload = require('express-fileupload');
const formidable = require('formidable');
require('dotenv').config();

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(fileUpload());
// user: red_onionDb
//  pass: buCu0muHaUzMdQ5U

const UPLOADS_FOLDER = "./uploads/";

var upload = multer({
  dest: UPLOADS_FOLDER
})

app.get('/', (req, res) => res.send('Hello World!'))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zingp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
        const database = client.db("red_onionDb");
        const foodCollection = database.collection("foodD");
        const usersCollection = database.collection("users");

        // get Food 
        app.get('/food', async(req, res)=>{
          const curser = foodCollection.find({})
          const food = await curser.toArray();
          res.json(food);
        });

      // create a document to insert
      app.post('/users', async(req, res)=>{
        const users = req.body;
        const result = await usersCollection.insertOne(users);
        res.json(result);
      })

      // POST Food Data on Server
      app.post('/food', async(req, res)=>{
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.amount;
        const key = req.body.productKey;
        const category = req.body.category;
        const stock = req.body.stock;
        const shipping = req.body.shipping;

        
        const pic = req.files.image;
        // console.log(req.files.image);
        const picData = pic.data;
        // console.log(picData);

        // let sharpBuffer = 'gtrhrt';
        sharp(picData).resize(200,200).png().toBuffer().then(async(data) => {
          
          const encodedPic = data.toString('base64');
          // console.log(encodedPic);
          const imageBuffer = Buffer.from(encodedPic, 'base64');
          // console.log(imageBuffer)
          const foodData = {
            key,
            name,
            category,
            stock,
            shipping,
            description,
            price,
            img: imageBuffer
          } 
          // console.log(foodData);
          const result = await foodCollection.insertOne(foodData);
          // console.log("buffer data",data);
          // sharpBuffer = data;
          // data.push(sharpBuffer)
          res.json(result);
          // res.end(data);
        });

        // console.log("second buffer data",sharpBuffer);
        // fs.writeFilesync('test.jpg', Sharp); 
        

      });
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))