export default {
  async execute({ message }) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return { status: "error", message: "N8N_WEBHOOK_URL not configured" };
    }
    
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, source: "ARC-Framework" })
    });
    
    return { status: "sent", message };
  }
};
