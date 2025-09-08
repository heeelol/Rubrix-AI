const express = require('express');
const router = express.Router();
const { analyzeText, generateHomework } = require('../services/analysis');

// Analyze text endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const analysis = await analyzeText(text);
        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze text' });
    }
});

// Generate homework endpoint
router.post('/generate-homework', async (req, res) => {
    try {
        const { scores } = req.body;
        if (!scores) {
            return res.status(400).json({ error: 'Scores are required' });
        }

        const homework = await generateHomework(scores);
        res.json({ homework });
    } catch (error) {
        console.error('Homework generation error:', error);
        res.status(500).json({ error: 'Failed to generate homework' });
    }
});

module.exports = router;
