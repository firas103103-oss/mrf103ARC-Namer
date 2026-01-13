const fetch = require('node-fetch');
module.exports = async function openaiAdapter({ prompt, tools }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      tools
    })
  });
  if (!res.ok) throw new Error('OpenAI error');
  const data = await res.json();
  return data.choices[0].message.content;
};
