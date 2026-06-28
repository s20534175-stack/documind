const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const supabase = require('../db/supabase');
const { chunkText } = require('../services/embeddings');
const { storeDocumentChunks, deleteDocumentChunks } = require('../services/vectorStore');

async function uploadDocument(req, res) {
  try {
    const { workspaceId } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { originalname, buffer, mimetype, size } = req.file;
    let text = '';
    if (mimetype === 'application/pdf') {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Only PDF and TXT files are supported' });
    }

    if (!text.trim()) return res.status(400).json({ error: 'Document appears to be empty' });

    const { data: existing } = await supabase.from('documents').select('id').eq('workspace_id', workspaceId).eq('name', originalname).single();
    let finalDocumentId = existing ? existing.id : uuidv4();

    if (!existing) {
      await supabase.from('documents').insert({ id: finalDocumentId, workspace_id: workspaceId, user_id: req.user.id, name: originalname, size, created_at: new Date().toISOString() });
    }

    const chunks = chunkText(text, 500, 100);
    const chunkCount = await storeDocumentChunks(workspaceId, finalDocumentId, originalname, chunks);

    res.status(201).json({ message: 'Document uploaded and indexed successfully', document: { id: finalDocumentId, name: originalname, size, chunkCount } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
}

async function getDocuments(req, res) {
  try {
    const { workspaceId } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    const { data, error } = await supabase.from('documents').select('id, name, size, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json({ documents: data });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch documents' }); }
}

async function deleteDocument(req, res) {
  try {
    const { workspaceId, documentId } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    await deleteDocumentChunks(documentId);
    await supabase.from('documents').delete().eq('id', documentId).eq('workspace_id', workspaceId);
    res.json({ message: 'Document deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete document' }); }
}

module.exports = { uploadDocument, getDocuments, deleteDocument };