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

// Function to handle user login
async function loginCheck(req, res) {
  try {
    const { email, password } = req.body; // Extract data from request body

    // Validate input fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const usersCollection = await connectToDb(); // Connect to 'users' collection

    // Find user by email
    const user = await usersCollection.findOne({ email });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res
        .status(401) // Unauthorized
        .json({ message: "Incorrect login email or password" });
    }

    // Successful login
    res.status(200).json({
      message: "Login successful",
      user: { email: user.email, name: user.name }, // Return only non-sensitive info
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { loginCheck };
