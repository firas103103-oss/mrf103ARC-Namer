const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.run = async ({ prompt, input }) => {
  const r = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: prompt || "You are ARC AI." },
      { role: "user", content: input }
    ]
  });
  return { provider:"openai", output: r.choices[0].message.content };
};
