const express = require('express');
const fs = require('fs');
const stringSimilarity = require('string-similarity');
const cors = require('cors');  // CORS প্যাকেজ ইমপোর্ট
const app = express();
const port = 3000;

// CORS middleware অ্যাড করা
app.use(cors());  // এটি আপনাকে সব উত্স থেকে রিকুয়েস্ট গ্রহণ করতে দিবে

// Middleware to parse JSON data
app.use(express.json());

// Function to read the data from the JSON file
function readData() {
  const rawData = fs.readFileSync('data.json');
  return JSON.parse(rawData);
}

// Function to write the data to the JSON file
function writeData(data) {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// GET request to fetch all Q&A data
app.get('/qa', (req, res) => {
  const data = readData();
  res.json(data);
});

// POST request to add new Q&A to the data.json
app.post('/qa', (req, res) => {
  const { question, answer } = req.body;
  const data = readData();
  const newEntry = { question, answer };
  data.push(newEntry);
  writeData(data);
  res.json({ message: "New question added!" });
});

// POST request to get bot response
app.post('/chat', (req, res) => {
  const userMessage = req.body.message;
  const data = readData();
  
  const bestMatch = stringSimilarity.findBestMatch(userMessage.toLowerCase(), data.map(qa => qa.question.toLowerCase()));
  
  if (bestMatch.bestMatch.rating > 0.7) {
    res.json({ answer: data[bestMatch.bestMatchIndex].answer });
  } else {
    res.json({ answer: "Sorry, I didn't understand that." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
