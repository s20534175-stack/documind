const supabase = require('../db/supabase');
const { ragChat } = require('../services/ragService');

async function chat(req, res) {
  try {
    const { workspaceId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const { data: history } = await supabase.from('chat_messages').select('role, content').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(6);
    const chatHistory = (history || []).reverse().map(m => ({ role: m.role, content: m.content }));

    const result = await ragChat(workspaceId, req.user.id, message.trim(), chatHistory);
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: `Chat failed: ${err.message}` });
  }
}

async function getChatHistory(req, res) {
  try {
    const { workspaceId } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    const { data, error } = await supabase.from('chat_messages').select('id, role, content, tool_calls, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ messages: data });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch chat history' }); }
}

module.exports = { chat, getChatHistory };