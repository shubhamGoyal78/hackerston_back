// store_userinfo.js

const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:*****@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'users' collection
async function connectToDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston DB
    return db.collection("users"); // Return 'users' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to store user information
const storeUserInfo = async (email, name, password) => {
  try {
    const usersCollection = await connectToDb(); // Connect to 'users' collection

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return { error: "Email already exists" };
    }

    // Create a new user object
    const newUser = {
      email,
      name,
      password, // In a real-world app, you should hash the password
    };

    // Insert the new user into the collection
    await usersCollection.insertOne(newUser);

    return { success: "User registered successfully!", user: newUser };
  } catch (error) {
    console.error("Error storing user info:", error);
    return { error: "Internal Server Error" };
  }
};

module.exports = { storeUserInfo };
