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
  userid: number;
}
interface likeDataInterface {
  likeValue: boolean,
  resourceID: number,
  userID: number
}

interface commentDataInterface {
  commentText: string,
  resourceID: number,
  userID: number
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

app.get("/users", async (req, res) => {
  try{
    const dbres = await client.query('select * from users order by is_faculty desc, name');
    res.status(200).json(dbres.rows);
  } catch(error){
    res.status(400)
    console.error(error)
  }
});

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
    const dbres = await client.query('select * from resources order by creation_date desc');
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

app.post('/likes', async (req,res) => {
  try{
    const likeData: likeDataInterface = req.body
    const dbres = await client.query('insert into likes (userid, resourceid, like_value) values ($1, $2, $3) returning *', [likeData.userID, likeData.resourceID, likeData.likeValue])
    res.status(200).send(dbres)
  }catch (error){
    res.status(400).send(error)
  }
})

app.post('/comments', async (req,res) => {
  try{
    const commentData: commentDataInterface = req.body
    const dbres = await client.query('insert into comments (userid, resourceid, comment_text) values ($1, $2, $3) returning *', [commentData.userID, commentData.resourceID, commentData.commentText])
    res.status(200).send(dbres)
  }catch (error){
    res.status(400).send(error)
  }
})

app.get('/resources/comments/:resource_id', async (req,res) =>{
  try{
    const resource_id = req.params.resource_id
    const dbres = await client.query('select * from comments where resourceid=$1', [resource_id])
    res.status(200).json(dbres.rows)
  }catch (error){
    res.status(400).send(error)
  }
})

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
      reasonForRecommendation,
      tags, 
      userid
    } = resourceData
    const tagsLowerCase = tags.toLowerCase()
    const postQuery = `insert into resources 
    (userid, recommendation_reasoning, original_recommendation, stage, content_type, description, author_name, url, name, tags)
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *`

    const postedQuery = await client.query(postQuery, [userid, reasonForRecommendation, recommendation, buildPhaseWeek, resourceType,
    description, authorName, URL, resourceName, tagsLowerCase])
    res.status(200).json({status: 'success', data: {
      info: postedQuery.rows,
    }})
  }catch(error){
    res.status(400)
    console.error(error)
  }

})

app.post('/studylist', async (req, res) => {
  try {
    const {userid, resourceid} = req.body
    const postQuery = 'insert into tostudy (userid, resourceid) values ($1, $2) returning *'
    const postedQuery = await client.query(postQuery, [userid, resourceid])
    res.status(200).json({status: 'success', data: {
      info: postedQuery.rows
    }})
  }catch(error){
    res.status(400).send(error)
    
  }
})

app.get('/studylist', async (req,res) => {
  try {
    const postQuery = `select resources.userid, resources.resourceid, recommendation_reasoning, original_recommendation, stage, 
    content_type, description, author_name, url, name, tags, creation_date
    from tostudy left join resources on tostudy.resourceid = resources.resourceid;`
    const dbres = await client.query(postQuery)
    res.status(200).json(dbres.rows)
  }catch(error){
    res.status(400).send(error)
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
