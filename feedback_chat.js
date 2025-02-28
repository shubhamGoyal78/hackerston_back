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
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("chat"); // Return 'chat' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// ✅ 1. Function for users and admin to send messages
async function sendMessage(req, res) {
  try {
    const { userId, sender, message } = req.body;

    if (!userId || !sender || !message) {
      return res
        .status(400)
        .json({ message: "User ID, sender, and message are required" });
    }

    const chatCollection = await connectToChatCollection();

    // Find if a chat thread exists for the user
    let chatThread = await chatCollection.findOne({ userId });

    if (!chatThread) {
      // If no chat exists, create a new chat document
      chatThread = {
        userId,
        messages: [],
        createdAt: new Date(),
      };
      await chatCollection.insertOne(chatThread);
    }

    // Add the new message to the conversation
    const newMessage = {
      sender, // 'user' or 'admin'
      message,
      timestamp: new Date(),
    };

    await chatCollection.updateOne(
      { userId },
      { $push: { messages: newMessage } }
    );

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ✅ 2. Function to fetch chat history for a user
async function fetchChatHistory(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chatCollection = await connectToChatCollection();
    const chatThread = await chatCollection.findOne({ userId });

    if (!chatThread) {
      return res.status(200).json({ messages: [] }); // Return empty array if no chat exists
    }

    res.status(200).json(chatThread.messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { sendMessage, fetchChatHistory };
