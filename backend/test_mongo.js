const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://Buddhima:buddhima321@cluster0.wscsft9.mongodb.net/rentease?retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("rentease");
    const reviews = db.collection("reviews");
    
    const allReviews = await reviews.find({}).toArray();
    console.log(JSON.stringify(allReviews, null, 2));

    const owners = db.collection("users");
    const allOwners = await owners.find({ role: "ROLE_OWNER" }).toArray();
    console.log("Owners:", allOwners.map(o => ({ id: o._id, username: o.username })));

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
