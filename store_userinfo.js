const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'users' collection
async function connectToDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("users"); // Return 'users' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to handle user registration
async function storeUserInfo(req, res) {
  try {
    const { email, name, password } = req.body; // Extract data from request body

    // Validate input fields
    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const usersCollection = await connectToDb(); // Connect to 'users' collection

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create a new user object
    const newUser = {
      email,
      name,
      password, // In production, always hash passwords before storing
      createdAt: new Date(), // Add a timestamp
    };

    // Insert the new user into the collection
    await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: "User registered successfully!",
      user: { email, name }, // Return only non-sensitive info
    });
  } catch (error) {
    console.error("Error storing user info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { storeUserInfo };
