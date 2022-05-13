import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

interface FormDataInterface {
  resourceName: string;
  authorName: string;
  URL: string;
  description: string;
  tags: string;
  resourceType: string;
  buildPhaseWeek: string;
  recommendation: string;
  reasonForRecommendation: string;
}

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/resources/:id", async (req, res) => {
  try{
    const id = req.params.id
    const dbres = await client.query('select * from resources where resourceid = $1', [id]);
    res.status(200).json(dbres.rows[0]);
  } catch(error){
    res.status(400)
    console.error(error)
  }
});

app.get("/resources", async (req, res) => {
  try{
    const dbres = await client.query('select * from resources');
    res.status(200).json(dbres.rows);
  } catch(error){
    res.status(400)
    console.error(error)
  }
});

app.get("/resources/tags", async (req, res) => {
  try{
    const dbres = await client.query('select * from resources inner join tags on resourceid = resourceid ');
    res.status(200).json(dbres.rows);
  } catch(error){
    res.status(400)
    console.error(error)
  }
});

app.post('/resources', async (req, res) => {
  try {
    const resourceData: FormDataInterface = req.body
    const {resourceName, 
      authorName,
      URL,
      description,
      resourceType,
      buildPhaseWeek,
      recommendation,
      reasonForRecommendation} = resourceData
    const postQuery = `insert into resources 
    (userid, recommendation_reasoning, original_recommendation, stage, content_type, description, author_name, url, name)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`

    const postedQuery = await client.query(postQuery, [1, reasonForRecommendation, recommendation, buildPhaseWeek, resourceType,
    description, authorName, URL, resourceName])
    res.status(200).json({status: 'success', data: {
      info: postedQuery.rows,
    }})
  }catch(error){
    res.status(400)
    console.error(error)
  }

})



//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
