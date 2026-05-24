// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatThreads = require('../models/message'); 

router.get('/', (req, res) => {
  res.json(chatThreads);
});

router.post('/inline-doubt', (req, res) => {
  const { parentMessageId, anchorText, userDoubt } = req.body;

  const parentMessage = chatThreads.find(msg => msg.id === parentMessageId);

  if (!parentMessage) {
    return res.status(404).json({ error: "Message not found" });
  }


  const mockAIResponse = `You asked about "${anchorText}". It means the server does not wait for an I/O operation to complete; it moves to the next request immediately, keeping the process highly efficient.`;

  const newDoubtThread = {
    doubtId: `doubt_${Date.now()}`,
    anchorText: anchorText,
    userQuestion: userDoubt,
    aiAnswer: mockAIResponse
  };


  parentMessage.inlineDoubts.push(newDoubtThread);

  res.status(201).json({ 
    message: "Inline doubt inserted successfully", 
    updatedChat: chatThreads 
  });
});

module.exports = router;