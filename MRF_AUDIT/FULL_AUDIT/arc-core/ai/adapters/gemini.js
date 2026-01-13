const fetch = require('node-fetch');
module.exports = async function geminiAdapter({ prompt, tools }) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools
      })
    });
  if (!res.ok) throw new Error('Gemini error');
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
};
