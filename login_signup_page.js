const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

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

// Function to handle both login and signup
async function loginOrSignup(req, res) {
  try {
    const { email } = req.body; // Extract email from request body

    // Validate input fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const usersCollection = await connectToDb(); // Connect to 'users' collection

    // Check if the user already exists
    let user = await usersCollection.findOne({ email });

    if (user) {
      // If user exists, log them in
      return res.status(200).json({
        message: "Login successful",
        user: { _id: user._id, email: user.email },
      });
    } else {
      // If user does not exist, register them
      const newUser = {
        _id: uuidv4(), // Generate a unique ID for the new user
        email,
        createdAt: new Date(), // Add a timestamp
      };

      // Insert the new user into the collection
      await usersCollection.insertOne(newUser);

      return res.status(201).json({
        message: "User registered and logged in successfully",
        user: { _id: newUser._id, email: newUser.email },
      });
    }
  } catch (error) {
    console.error("Error during login/signup:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { loginOrSignup };
