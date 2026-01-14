const axios = require("axios");

exports.run = async ({ prompt, input }) => {
  const r = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: (prompt||"") + "\n" + input }] }] }
  );
  return { provider:"gemini", output: r.data.candidates[0].content.parts[0].text };
};
