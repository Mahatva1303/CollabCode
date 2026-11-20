
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function generateWithGroq({
    messages,
    workspaceContext,
}) {
    const systemMessage = {
        role: 'system',
        content: `
You are Wingsman, the coding assistant inside CollabCode.

WORKSPACE CONTEXT:
${workspaceContext || 'No workspace context was provided.'}

IMPORTANT RESPONSE RULES:

For normal questions, explanations, and advice:
Return a normal JSON object:
{
  "type": "chat",
  "message": "Your Markdown response here."
}

For requests to create, modify, fix, refactor, or optimize code:
Return this JSON object:
{
  "type": "code_edit",
  "message": "Brief explanation of the proposed changes.",
  "filePath": "exact existing workspace file path",
  "code": "complete updated file content"
}

STRICT RULES:
- Always return valid JSON matching one of these formats.
- Never use Markdown code fences around the JSON.
- Never return plain text outside the JSON object.
- For code edits, provide the COMPLETE updated file.
- Only modify files that exist in the supplied workspace context.
- Preserve unrelated existing functionality.
- Never claim that changes have been applied.
- The user must accept a proposal before changes are applied.
- If the requested file does not exist or the request is unclear, return:
  {"type":"chat","message":"Your clarification question here."}
- Keep responses beginner-friendly.
`,
    };

    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
            systemMessage,
            ...messages,
        ],
        temperature: 0.2,
        max_tokens: 4096,
    });

    return response.choices[0].message.content;
}

async function generateInlineCompletion({
    code,
    cursorContext,
    filePath,
    workspaceContext,
}) {
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
            {
                role: 'system',
                content: `
You are Wingsman, an inline code completion assistant.

Suggest the most useful continuation for the code at the cursor.

Rules:
- Return ONLY the code that should be inserted at the cursor.
- Do not repeat code that already exists.
- Do not use Markdown code fences.
- Do not explain your suggestion.
- Preserve the existing coding style.
- Keep suggestions short and relevant.
- If no useful completion is possible, return an empty string.

File: ${filePath}

Workspace context:
${workspaceContext || 'No additional context provided.'}

Code around cursor:
${cursorContext}
`,
            },
        ],
        temperature: 0.2,
        max_tokens: 256,
    });

    return response.choices[0].message.content?.trim() || '';
}

module.exports = {
    generateWithGroq,
    generateInlineCompletion,
};
