const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("cors");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (make sure to replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect(
  "mongodb+srv://karthikpk:gIjldgmsl4RIbTjC@cluster0.gqs5mti.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

// Event listener for connection error
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Create a Player schema
const playerSchema = new mongoose.Schema({
  playerName: String,
  playerScore: Number,
});

// Create a Player model based on the schema
const Player = mongoose.model("Player", playerSchema);

app.post("/addPlayer", async (req, res) => {
  const { playerName, playerScore } = req.body;

  // Create a new player instance
  const newPlayer = new Player({
    playerName,
    playerScore,
  });

  // Save the player to the database
  try {
    const savedPlayer = await newPlayer.save();
    res.send(
      `Player ${savedPlayer.playerName} added successfully with ID ${savedPlayer._id}`
    );
  } catch (error) {
    res.status(500).send("Error saving player to the database");
  }
});

app.get("/players", async (req, res) => {
  try {
    // Retrieve all players from the database
    const players = await Player.find();

    // Render an HTML page with player information
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta property="og:title"         content="Your Website Title" />
        <meta property="og:description"   content="Your description" />
        <meta property="og:image"         content="https://images.unsplash.com/photo-1522252234503-e356532cafd5?q=80&w=1450&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <title>Player Information</title>
      </head>
      <body>
        <h1>Player Information</h1>
        <ul>
          ${players
            .map(
              (player) => `<li>${player.playerName}: ${player.playerScore}</li>`
            )
            .join("")}
        </ul>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send("Error retrieving players from the database");
  }
});

app.get("/players/:id", async (req, res) => {
  const playerId = req.params.id;

  try {
    // Find a player by ID in the database
    const player = await Player.findById(playerId);

    if (player) {
      res.send(
        `<h1>${player.playerName}'s Information</h1><p>Score: ${player.playerScore}</p>`
      );
    } else {
      res.status(404).send("Player not found");
    }
  } catch (error) {
    res.status(500).send("Error retrieving player from the database");
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
