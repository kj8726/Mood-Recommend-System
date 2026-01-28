require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("public"));
const PORT = 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;


// Mood → Place types mapping
const moodMap = {
  happy: [
    "restaurant",
    "cafe",
    "bakery",
    "movie_theater",
    "shopping_mall",
    "amusement_park"
  ],

  energetic: [
    "park",
    "gym",
    "stadium",
    "tourist_attraction",
    "bowling_alley",
    "hiking_area"
  ],

  sad: [
    "temple",
    "church",
    "mosque",
    "cemetery",
    "library",
    "art_gallery"
  ],

  relaxed: [
    "spa",
    "lake",
    "garden",
    "park",
    "museum",
    "book_store",
    "cafe"
  ]
};


app.get("/recommend", async (req, res) => {
  const { mood, lat, lng } = req.query;

  const types = moodMap[mood];
  if (!types) return res.status(400).send("Invalid mood");

  try {
    let results = [];

    for (let type of types) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=${type}&key=${GOOGLE_API_KEY}`;

      const response = await axios.get(url);
      results.push(...response.data.results);
    }

    res.json(results);
  } catch (err) {
    res.status(500).send("Error fetching places");
  }
});

app.get("/config", (req, res) => {
  res.json({
    apiKey: process.env.GOOGLE_API_KEY
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
