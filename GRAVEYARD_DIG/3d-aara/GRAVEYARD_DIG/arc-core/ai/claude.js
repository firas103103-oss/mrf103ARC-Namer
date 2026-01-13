const axios = require("axios");

exports.run = async ({ prompt, input }) => {
  const r = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-3-haiku-20240307",
      max_tokens: 512,
      messages: [{ role:"user", content: (prompt||"") + "\n" + input }]
    },
    { headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    }}
  );
  return { provider:"claude", output: r.data.content[0].text };
};
