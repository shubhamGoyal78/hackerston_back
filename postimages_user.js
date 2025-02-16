const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToUsersDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function postUserImages(req, res) {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Params:", req.params);

    const { userid } = req.params;
    const { image_links, title } = req.body;

    if (
      !userid ||
      !Array.isArray(image_links) ||
      image_links.length === 0 ||
      !title
    ) {
      return res.status(400).json({
        message: "userid (in URL), title, and image_links array are required",
      });
    }

    const usersCollection = await connectToUsersDb();

    let userQuery = { _id: userid };
    try {
      userQuery = { _id: new ObjectId(userid) };
    } catch (err) {
      console.warn("User ID is not an ObjectId, using string instead.");
    }

    const userExists = await usersCollection.findOne(userQuery);
    console.log("User Found:", userExists);

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get current date and time in IST
    const istDateTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // Create the image group structure with timestamp
    const imageGroup = {
      title,
      images: image_links,
      timestamp: istDateTime, // Saving the timestamp
    };

    const updatedUser = await usersCollection.findOneAndUpdate(
      userQuery,
      { $push: { image_groups: imageGroup } }, // Store in `image_groups`
      { returnDocument: "after" }
    );

    res.status(200).json({
      message: "Images added successfully!",
      user: updatedUser.value,
    });
  } catch (error) {
    console.error("Error updating user images:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { postUserImages };
