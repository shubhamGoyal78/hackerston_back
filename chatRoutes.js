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

// ✅ 1. Send Message (Using _id Instead of userId)
async function sendMessage(req, res) {
  try {
    let { _id, userId, message } = req.body;

    if (!_id || !message) {
      return res
        .status(400)
        .json({ message: "Chat ID (_id) and message are required" });
    }

    const chatCollection = await connectToChatCollection();

    // Validate _id format
    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid Chat ID (_id)" });
    }

    const chatId = new ObjectId(_id);

    // Check if chat exists
    let chatThread = await chatCollection.findOne({ _id: chatId });

    if (!chatThread) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Detect sender type
    const sender = userId === ADMIN_ID ? "admin" : "user";

    // Create message object
    const newMessage = {
      sender,
      message,
      timestamp: new Date(),
    };

    // ✅ Update the chat with the new message
    await chatCollection.updateOne(
      { _id: chatId },
      { $push: { messages: newMessage } }
    );

    res.status(201).json({ chatId: _id, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ 2. Fetch Chat History
async function fetchChatHistory(req, res) {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const chatCollection = await connectToChatCollection();

    // Validate chatId format
    if (!ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const chatThread = await chatCollection.findOne({
      _id: new ObjectId(chatId),
    });

    if (!chatThread) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chatThread);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { sendMessage, fetchChatHistory };
