const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'chat' collection
async function connectToChatCollection() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("chat");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// ✅ Create or Fetch Existing Chat
async function createNewChat(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chatCollection = await connectToChatCollection();

    // Check if a chat already exists for the user
    let chatThread = await chatCollection.findOne({ userId });

    if (chatThread) {
      // If chat exists, return the existing chatId
      return res.status(200).json({ chatId: chatThread._id.toString() });
    }

    // If no chat exists, create a new chat document
    const newChat = {
      userId,
      messages: [],
      createdAt: new Date(),
    };

    const result = await chatCollection.insertOne(newChat);
    const chatId = result.insertedId.toString(); // Convert ObjectId to string

    res.status(201).json({ chatId });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { createNewChat };
