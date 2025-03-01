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

// ✅ Admin Reply API with IST Timestamp
async function sendAdminMessage(req, res) {
  try {
    let { chatId, message } = req.body;

    if (!chatId || !message) {
      return res
        .status(400)
        .json({ message: "Chat ID and message are required" });
    }

    const chatCollection = await connectToChatCollection();
    const chatObjectId = new ObjectId(chatId);

    // ✅ Check if the chat exists
    let chatThread = await chatCollection.findOne({ _id: chatObjectId });

    if (!chatThread) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Convert timestamp to Indian Standard Time (IST)
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // Create admin message object with IST timestamp
    const newMessage = {
      sender: "admin",
      message,
      timestamp,
    };

    // ✅ Update the chat with the new message
    await chatCollection.updateOne(
      { _id: chatObjectId },
      { $push: { messages: newMessage } }
    );

    res
      .status(201)
      .json({ chatId, message: "Admin message sent successfully" });
  } catch (error) {
    console.error("Error sending admin message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { sendAdminMessage };
