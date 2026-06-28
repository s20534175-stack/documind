const { CohereClient } = require('cohere-ai');
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

async function generateEmbedding(text) {
  const res = await cohere.embed({ texts: [text], model: 'embed-english-v3.0', inputType: 'search_document' });
  return res.embeddings[0];
}

function chunkText(text, chunkSize = 500, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 20) chunks.push(chunk.trim());
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

module.exports = { generateEmbedding, chunkText };