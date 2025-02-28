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
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("chat"); // Return 'chat' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// ✅ 1. Send Message (Admin to User OR User to Admin)
async function sendMessage(req, res) {
  try {
    let { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    // Determine sender (Admin or User)
    const sender = userId === ADMIN_ID ? "admin" : "user";

    const chatCollection = await connectToChatCollection();

    // Find or create chat thread between user and admin
    let chatThread = await chatCollection.findOne({ userId });

    if (!chatThread) {
      chatThread = {
        userId,
        messages: [],
        createdAt: new Date(),
      };
      await chatCollection.insertOne(chatThread);
    }

    // Add the new message to the conversation
    const newMessage = {
      sender,
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

// ✅ 2. Fetch Chat History (Admin or User)
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
