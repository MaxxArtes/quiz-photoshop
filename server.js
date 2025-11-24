import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());

// Servir o arquivo HTML (Frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Rota Segura: O Frontend chama AQUI, e não o Google direto
app.post('/api/gerar', async (req, res) => {
    const { topic } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // A chave vem do ambiente do Render!

    if (!apiKey) {
        return res.status(500).json({ error: 'Chave API não configurada no servidor' });
    }

    const prompt = `
        Crie 1 pergunta de quiz técnico sobre Photoshop, tema: "${topic}".
        Retorne APENAS um JSON válido neste formato exato, sem markdown:
        {
            "pergunta": "Enunciado da pergunta?",
            "alternativas": ["A", "B", "C", "D"],
            "correta": 0,
            "explicacao": ["Dica 1", "Dica 2"]
        }
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        res.json({ text }); // Devolve o texto da IA para o frontend

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao falar com o Gemini' });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));