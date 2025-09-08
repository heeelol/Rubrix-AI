const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize the Bedrock client
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    },
    maxAttempts: 3,
    retryMode: 'standard',
    logger: console
});

async function analyzeText(text) {
    try {
        // Validate AWS credentials before making the request
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error('AWS credentials are not properly configured');
        }

        const systemPrompt = `You are an AI tutor that analyzes student homework.`;
        const userPrompt = `
<homework>${text}</homework>

<instructions>
Analyze the student's work and identify flaws in the homework regarding each of these categories, envelope within <analysis> tags:
- Grammar
- Vocabulary
- Writing
- Spelling
- Punctuation

Provide a strength index (1 to 5), in JSON format, enveloped in tags <attribute-scores>:
{
  "Grammar": 5.00,
  "Vocabulary": 3.14,
  "Writing": 2.23,
  "Spelling": 1.19,
  "Punctuation": 4.56
}
</instructions>`;

        console.log('Sending request to AWS Bedrock...');
        const input = {
            modelId: 'anthropic.claude-instant-v1',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                system: systemPrompt,
                max_tokens: 500,
                temperature: 0.3,
                top_p: 0.9,
                messages: [
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]
            })
        };

        const command = new InvokeModelCommand(input);
        const response = await bedrockClient.send(command);
        
        // Parse the response
        const responseBody = JSON.parse(Buffer.from(response.body).toString());
        console.log('Response body:', JSON.stringify(responseBody, null, 2));
        const fullResponse = responseBody.content[0].text;

        // Extract scores
        const scoresMatch = fullResponse.match(/<attribute-scores>(.*?)<\/attribute-scores>/s);
        let scores;
        if (scoresMatch) {
            scores = JSON.parse(scoresMatch[1]);
        } else {
            scores = {
                "Grammar": 5,
                "Vocabulary": 5,
                "Writing": 5,
                "Spelling": 5,
                "Punctuation": 5
            };
        }

        // Extract analysis
        const analysisMatch = fullResponse.match(/<analysis>(.*?)<\/analysis>/s);
        let feedback;
        if (analysisMatch) {
            feedback = analysisMatch[1].trim().split('\n').map(line => line.trim());
        } else {
            const taggedFeedback = [];
            const categories = ['Grammar', 'Vocabulary', 'Writing', 'Spelling', 'Punctuation'];
            for (const category of categories) {
                const match = fullResponse.match(new RegExp(`<${category}>(.*?)</${category}>`, 's'));
                if (match) {
                    taggedFeedback.push(match[0].trim());
                }
            }
            feedback = taggedFeedback.length > 0 ? taggedFeedback : [fullResponse];
        }

        return {
            scores,
            feedback
        };
    } catch (error) {
        console.error('Analysis error:', error);
        
        if (error.$metadata?.httpStatusCode === 403) {
            throw new Error('AWS Authentication failed. Please check your credentials and permissions for Bedrock service.');
        } else if (error.$metadata?.httpStatusCode === 404) {
            throw new Error('AWS Bedrock service not available in this region or model ID is incorrect.');
        }
        
        console.error('Error details:', {
            fault: error.$fault,
            metadata: error.$metadata,
            message: error.message,
            stack: error.stack
        });
        
        throw error;
    }
}

async function generateHomework(scores) {
    try {
        // Ensure scores is an object and has entries
        if (!scores || typeof scores !== 'object') {
            return { exercises: [] };
        }

        // Find the weakest areas
        const sortedScores = Object.entries(scores)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 2); // Focus on top 2 weakest areas

        if (sortedScores.length === 0) {
            return { exercises: [] };
        }

        const systemPrompt = `You are an AI tutor that generates practice exercises for students.`;
        const userPrompt = `
Generate 3 practice exercises focusing on improving these areas: ${sortedScores.map(([area]) => area).join(', ')}.
Format the response as JSON with this structure:
{
  "exercises": [
    {
      "type": "area name",
      "question": "exercise question",
      "answer": "correct answer or solution",
      "explanation": "why this is correct"
    }
  ]
}`;

        const input = {
            modelId: 'anthropic.claude-instant-v1',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                system: systemPrompt,
                max_tokens: 1000,
                temperature: 0.7,
                messages: [
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]
            })
        };

        const command = new InvokeModelCommand(input);
        const response = await bedrockClient.send(command);
        
        // Parse and return the response
        const responseBody = JSON.parse(Buffer.from(response.body).toString());
        const fullResponse = responseBody.content[0].text;
        
        try {
            // Parse the exercises JSON from the response
            const exercisesMatch = fullResponse.match(/\{[\s\S]*\}/);
            if (!exercisesMatch) {
                return { exercises: [] };
            }
            
            const parsedResponse = JSON.parse(exercisesMatch[0]);
            return {
                exercises: Array.isArray(parsedResponse.exercises) ? parsedResponse.exercises : []
            };
        } catch (parseError) {
            console.error('Error parsing exercises JSON:', parseError);
            return {
                exercises: []
            };
        }
    } catch (error) {
        console.error('Homework generation error:', error);
        return { exercises: [] };
    }
}

module.exports = {
    analyzeText,
    generateHomework
};
