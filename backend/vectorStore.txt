const supabase = require('../db/supabase');
const { generateEmbedding } = require('./embeddings');

async function storeDocumentChunks(workspaceId, documentId, documentName, chunks) {
  await supabase.from('document_chunks').delete().eq('document_id', documentId);

  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    rows.push({ workspace_id: workspaceId, document_id: documentId, document_name: documentName, chunk_index: i, content: chunks[i], embedding: JSON.stringify(embedding) });
  }

  const { error } = await supabase.from('document_chunks').insert(rows);
  if (error) throw new Error(`Failed to store chunks: ${error.message}`);
  return rows.length;
}

async function retrieveRelevantChunks(workspaceId, query, topK = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    match_workspace_id: workspaceId,
    match_count: topK,
  });
  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  return data || [];
}

async function deleteDocumentChunks(documentId) {
  const { error } = await supabase.from('document_chunks').delete().eq('document_id', documentId);
  if (error) throw new Error(`Failed to delete chunks: ${error.message}`);
}

module.exports = { storeDocumentChunks, retrieveRelevantChunks, deleteDocumentChunks };