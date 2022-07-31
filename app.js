const express = require('express');
const { MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');


// import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('documents');

  // const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
// console.log('Inserted documents =>', insertResult);

// const filteredDocs = await collection.find({ a: 3 }).toArray();
// console.log('Found documents filtered by { a: 3 } =>', filteredDocs);



const app = express();  

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',async (req,res)=>{
    res.send('home page');
    
})


app.get('/api/v3/app/events', async (req,res)=>{
  if(req.query.id){
    console.log("in the id route")
    const {id}=req.query;
    result = await collection.findOne({'_id':ObjectId(id)})
    return res.send(result);
  }
  else{
    if(req.query.type&&req.query.limit&&req.query.page){

      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
      const {type}= req.query
      var sortBy;
      if(type==='latest'){
         sortBy= -1;
      }else{
         sortBy= 1;
      }

      const cursor = collection.find()
      .skip(parseInt((page-1)*limit))
      .limit(parseInt(limit), function (e, d) {})
      .sort({_id: sortBy})


      if ((await cursor.countDocuments) === 0) {
        
        console.log("No documents found!");
      }
      await cursor.forEach(console.dir);
      
      res.send(cursor);
    }
  }
})

app.post('/api/v3/app/events',async(req,res)=>{
  const newEvent = await collection.insertOne(req.body)
  res.send(newEvent.insertedId)

})


app.put('/api/v3/app/events/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id);
  const result = await collection.updateOne({'_id':ObjectId(id)} , {$set:{...req.body}},{ upsert: false });
  if (result.modifiedCount === 1) {
    console.log("Successfully Updated one document.");
  } else {
    console.log("No documents matched the query. modified 0 documents.");
  }
  res.send(result)

})


app.delete('/api/v3/app/events/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id);
  const result = await collection.deleteOne({'_id':ObjectId(id)} );
  if (result.deletedCount === 1) {
    console.log("Successfully deleted one document.");
  } else {
    console.log("No documents matched the query. Deleted 0 documents.");
  }
  res.send(result);
})

app.listen(3000,()=>{
    console.log('connected to localhost 3000')
})



}

main()
  .then(console.log)
  .catch(console.error)
