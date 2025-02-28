const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Default Admin ID
const ADMIN_ID = "cc56704e-8e99-4d95-9849-657cf38678e0";

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

// ✅ 1. Send Message (Admin or User)
async function sendMessage(req, res) {
  try {
    let { userId, message, chatId } = req.body; // chatId = _id in MongoDB

    if (!userId || !message || !chatId) {
      return res
        .status(400)
        .json({ message: "User ID, Chat ID, and message are required" });
    }

    // Detect sender type
    const sender = userId === ADMIN_ID ? "admin" : "user";

    const chatCollection = await connectToChatCollection();

    // Convert chatId to MongoDB ObjectId
    const chatObjectId = new ObjectId(chatId);

    // Find the chat document using _id
    let chatThread = await chatCollection.findOne({ _id: chatObjectId });

    if (!chatThread) {
      return res.status(404).json({ message: "Chat thread not found" });
    }

    // Add the new message
    const newMessage = {
      sender,
      message,
      timestamp: new Date(),
    };

    await chatCollection.updateOne(
      { _id: chatObjectId },
      { $push: { messages: newMessage } }
    );

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ 2. Fetch Chat History (Admin or User)
async function fetchChatHistory(req, res) {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const chatCollection = await connectToChatCollection();
    const chatObjectId = new ObjectId(chatId);
    const chatThread = await chatCollection.findOne({ _id: chatObjectId });

    if (!chatThread) {
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json(chatThread.messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { sendMessage, fetchChatHistory };
