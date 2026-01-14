const fetch = require('node-fetch');
module.exports = async function claudeAdapter({ prompt, tools }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      tools
    })
  });
  if (!res.ok) throw new Error('Claude error');
  const data = await res.json();
  return data.content[0].text;
};
