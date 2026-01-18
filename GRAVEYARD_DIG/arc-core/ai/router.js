const openai = require("./openai");
const claude = require("./claude");
const gemini = require("./gemini");

const providers = { openai, claude, gemini };

exports.run = async ({ provider="openai", prompt, input }) => {
  if (!providers[provider]) throw new Error("INVALID_PROVIDER");
  try {
    return await providers[provider].run({ prompt, input });
  } catch (e) {
    if (provider !== "openai") return providers.openai.run({ prompt, input });
    throw e;
  }
};
