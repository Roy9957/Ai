const express = require('express');
const cors = require('cors');
const natural = require('natural');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, child } = require('firebase/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3jhFCaX_G67pzsnH9JopGG8WuWkozu6g",
  authDomain: "artificial-intelligence-0134.firebaseapp.com",
  databaseURL: "https://artificial-intelligence-0134-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "artificial-intelligence-0134",
  storageBucket: "artificial-intelligence-0134.firebasestorage.app",
  messagingSenderId: "183611137008",
  appId: "1:183611137008:web:8d56d2f4c8aba8b6ae5b35"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Fetch QA data from Firebase Realtime Database
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'qa'));
    if (snapshot.exists()) {
      const data = snapshot.val();

      // Tokenizer for text comparison
      const tokenizer = new natural.WordTokenizer();
      const similarityThreshold = 0.7;

      let bestMatch = { question: "", answer: "", score: 0 };

      // Compare user input with each question in the database
      for (const key in data) {
        const qa = data[key];
        const tokenizedQuestion = tokenizer.tokenize(qa.question.toLowerCase());
        const tokenizedInput = tokenizer.tokenize(userMessage.toLowerCase());

        // Calculate Jaccard similarity
        const similarity = natural.JaccardDistance(tokenizedQuestion, tokenizedInput);

        if (similarity > bestMatch.score && similarity > similarityThreshold) {
          bestMatch = { question: qa.question, answer: qa.answer, score: similarity };
        }
      }

      // Return best match or fallback answer
      if (bestMatch.answer) {
        res.json({ answer: bestMatch.answer });
      } else {
        res.json({ answer: "Sorry, I didn't understand that." });
      }
    } else {
      res.status(404).json({ error: 'QA data not found in the database' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from Firebase' });
  }
});

// Export the app as a serverless function for Vercel
module.exports = app;
