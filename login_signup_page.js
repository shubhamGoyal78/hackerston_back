const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique user ID

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

// Function to generate a unique 7-character alphanumeric referral code
async function generateReferralCode(usersCollection) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = Array.from(
      { length: 7 },
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join("");
    const existingUser = await usersCollection.findOne({
      referral_code: referralCode,
    });
    if (!existingUser) {
      isUnique = true; // Ensure the referral code is unique
    }
  }

  return referralCode;
}

// Function to handle both login and signup
async function loginOrSignup(req, res) {
  try {
    const { email } = req.body; // Extract email from request body

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const usersCollection = await connectToDb(); // Connect to 'users' collection

    // Check if the user already exists
    let user = await usersCollection.findOne({ email });

    if (user) {
      // If user exists, log them in and return their details
      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          referral_code: user.referral_code,
          referrals_count: user.referrals_count, // Added field
          successful_count: user.successful_count, // Added field
        },
      });
    } else {
      // Generate a unique referral code for the new user
      const referralCode = await generateReferralCode(usersCollection);

      // Create a new user object with additional fields
      const newUser = {
        _id: uuidv4(), // Generate a unique ID for the new user
        email,
        referral_code: referralCode, // Assign the referral code
        referrals_count: 0, // Initialize referral count
        successful_count: 0, // Initialize successful referral count
        createdAt: new Date(), // Add a timestamp
      };

      // Insert the new user into the collection
      await usersCollection.insertOne(newUser);

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          email: newUser.email,
          referral_code: newUser.referral_code,
          referrals_count: newUser.referrals_count, // Added field
          successful_count: newUser.successful_count, // Added field
        },
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
