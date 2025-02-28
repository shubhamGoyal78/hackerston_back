const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

async function postMessage(req, res) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    const db = await connectToDb();
    const usersCollection = db.collection("users");
    const chatCollection = db.collection("public_chat");

    // 🔥 FIX: Remove ObjectId conversion 🔥
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const name = user.email.split("@")[0]; // Extract username from email

    const newMessage = {
      userId,
      name,
      message,
      timestamp: new Date(),
    };

    await chatCollection.insertOne(newMessage);
    return res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error posting message:", error.message, error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ GET: Fetch messages
async function getMessages(req, res) {
  try {
    const db = await connectToDb();
    const chatCollection = db.collection("public_chat");

    const messages = await chatCollection
      .find()
      .sort({ timestamp: -1 }) // Newest messages first
      .limit(50) // Limit to 50 messages
      .toArray();

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { postMessage, getMessages };
