const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs
const jwt = require("jsonwebtoken"); // Import jsonwebtoken to generate JWT tokens

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

    // Function to generate JWT token
    const generateToken = (userId) => {
      return jwt.sign({ userId }, "your_jwt_secret", { expiresIn: "1h" }); // Expiry time can be adjusted
    };

    if (user) {
      // If user exists, log them in and generate a JWT token
      const token = generateToken(user._id);

      return res.status(200).json({
        message: "Login successful",
        user: { _id: user._id, email: user.email },
        token: token, // Send the token back to the client
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

      // Generate JWT token for the new user
      const token = generateToken(newUser._id);

      return res.status(201).json({
        message: "User registered and logged in successfully",
        user: { _id: newUser._id, email: newUser.email },
        token: token, // Send the token back to the client
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
