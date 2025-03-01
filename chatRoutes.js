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

// ✅ 1. Create New Chat
async function createNewChat(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chatCollection = await connectToChatCollection();

    // Create a new chat document
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

// ✅ 2. Send Message (Create Chat if Needed)
async function sendMessage(req, res) {
  try {
    let { chatId, userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    const chatCollection = await connectToChatCollection();

    // If chatId is not provided, check if a chat exists for the user
    if (!chatId) {
      let chatThread = await chatCollection.findOne({ userId });

      if (!chatThread) {
        // ✅ No chat exists, so create a new chat
        const newChat = {
          userId,
          messages: [],
          createdAt: new Date(),
        };

        const result = await chatCollection.insertOne(newChat);
        chatId = result.insertedId.toString(); // Convert ObjectId to string
      } else {
        chatId = chatThread._id.toString(); // Use existing chat ID
      }
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
      { _id: new ObjectId(chatId) },
      { $push: { messages: newMessage } }
    );

    res.status(201).json({ chatId, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ 3. Fetch Chat History
async function fetchChatHistory(req, res) {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }

    const chatCollection = await connectToChatCollection();
    const chatThread = await chatCollection.findOne({
      _id: new ObjectId(chatId),
    });

    if (!chatThread) {
      return res.status(200).json({ messages: [] });
    }

    res.status(200).json(chatThread); // Send the full chat object
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { createNewChat, sendMessage, fetchChatHistory };
