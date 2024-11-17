import express from 'express';
import { OpenAI } from 'openai';
import path from 'path';

const app = express();

const openai = new OpenAI({
    apiKey: "",  // Set your OpenAI API key here
});

const port = 3000;
app.use(express.json());
app.use(express.static('public'));

// Route to serve the main quiz page
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Route to get quiz questions from OpenAI
app.post('/get-quiz', async (req, res) => {
    const { subject, language } = req.body;

    try {
        let content = `I need a JSON file. There should be 10 \"questions\", with a \"fact\" and an \"answer\". The \"answer\" should be 1 for true and 0 for false.\n\nYou have to generate fake facts AND find real actual true facts. There should be a random amount of fake and true facts, and both should either confirm or disprove the following statement: \"${subject}\"\n\nYou have to put those facts inside the \"questions\". If the fact is fake fact you generated, the answer should be 0 (false). If the fact is a real fact, the answer should be 1 (true). The questions should be redacted in ${language === 'jp' ? 'Japanese' : 'English'}. Thank you.`;
        console.log(content);

        // Request the OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a data generator capable of creating structured JSON files with both fabricated and real information that you gather online. When generating responses, adhere to the instructions given to provide realistic JSON outputs for the user\'s request. You should not talk and the output should not include ``` or "json", only give JSON output.'
                },
                {
                    role: 'user',
                    content: content,
                },
            ],
        });

        const result = response.choices[0].message.content;
        const quizData = JSON.parse(result);

        res.json({ quizData, subject });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Error generating quiz questions.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});