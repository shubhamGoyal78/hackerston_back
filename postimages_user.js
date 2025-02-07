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
    console.log("Request Body:", req.body); // ✅ Debugging log
    console.log("Request Params:", req.params); // ✅ Debugging log

    const { userid } = req.params;
    const { image_links } = req.body;

    if (!userid || !Array.isArray(image_links) || image_links.length === 0) {
      return res
        .status(400)
        .json({
          message: "userid (in URL) and image_links array are required",
        });
    }

    const usersCollection = await connectToUsersDb();

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: userid }, // Find by userid
      { $push: { image_link: { $each: image_links } } }, // Push multiple images
      { returnDocument: "after" }
    );

    if (!updatedUser.value) {
      return res.status(404).json({ message: "User not found" });
    }

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
