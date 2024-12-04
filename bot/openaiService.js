const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            baseURL: process.env.OPENAI_API_BASE,
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateResponse(prompt) {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { role: "system", content: "你是一个友好的助手，可以帮助回答各种问题。" },
                    { role: "user", content: prompt }
                ],
                model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 1000,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API调用错误:', error);
            return '抱歉，我现在无法回答这个问题。请稍后再试。';
        }
    }
}

module.exports = OpenAIService;
