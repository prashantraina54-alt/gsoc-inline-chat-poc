const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const app = express();
const PORT = 8000;


const API_KEY = process.env.API_KEY; 
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let chatMessages = [
    {
        id: "msg_1",
        content: "Inline contextual chat allows users to highlight specific snippets of text and query an LLM directly. This localized context window prevents the AI from hallucinating and provides highly targeted explanations.",
        inlineDoubts: []
    },
    {
        id: "msg_2",
        content: "By anchoring user queries to specific DOM elements, the frontend can seamlessly route parent message IDs and selected text strings to the backend API layer.",
        inlineDoubts: []
    },
    {
        id: "msg_3",
        content: "When integrating external LLM APIs, it is crucial to implement robust error handling and asynchronous loading states in the UI to account for unpredictable network latency and potential rate limits.",
        inlineDoubts: []
    },
    {
        id: "msg_4",
        content: "For state management, storing conversation history in-memory is acceptable for a Proof of Concept. However, a production environment requires a scalable database with proper indexing on parent and child message IDs.",
        inlineDoubts: []
    },
    {
        id: "msg_5",
        content: "Security is paramount. Always sanitize user inputs on the backend before sending them to the generative model to mitigate the risk of prompt injection attacks and safeguard system integrity.",
        inlineDoubts: []
    }
];

app.get('/api/chat', (req, res) => {
    res.json(chatMessages);
});

app.post('/api/chat/inline-doubt', async (req, res) => {
    const { parentMessageId, anchorText, userQuestion } = req.body;

    if (!parentMessageId || !anchorText || !userQuestion) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const messageIndex = chatMessages.findIndex(m => m.id === parentMessageId);

    if (messageIndex !== -1) {
        try {
            // Yahan 100% stable "gemini-pro" model use ho raha hai
            const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

            const aiPrompt = `
                You are a helpful teaching assistant. 
                The user has highlighted this specific text from a lesson: "${anchorText}"
                Based on that highlighted text, the user is asking this doubt: "${userQuestion}"
                
                Please provide a clear, concise, and helpful answer in 1 or 2 short paragraphs.
            `;

            const result = await model.generateContent(aiPrompt);
            const actualAiAnswer = result.response.text();

            chatMessages[messageIndex].inlineDoubts.push({
                anchorText,
                userQuestion,
                aiAnswer: actualAiAnswer
            });

            return res.status(200).json({ success: true });

        } catch (error) {
            console.error("AI Error:", error);
            return res.status(500).json({ error: "Failed to connect to AI." });
        }
    } else {
        return res.status(404).json({ error: "Parent message ID not found." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


