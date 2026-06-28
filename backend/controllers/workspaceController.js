const { v4: uuidv4 } = require('uuid');
const supabase = require('../db/supabase');

async function getWorkspaces(req, res) {
  try {
    const { data, error } = await supabase.from('workspaces').select('id, name, created_at').eq('user_id', req.user.id).order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    res.json({ workspaces: data });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch workspaces' }); }
}

async function createWorkspace(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Workspace name is required' });
    const id = uuidv4();
    const { data, error } = await supabase.from('workspaces').insert({ id, user_id: req.user.id, name: name.trim().slice(0, 100), created_at: new Date().toISOString() }).select().single();
    if (error) throw new Error(error.message);
    res.status(201).json({ workspace: data });
  } catch (err) { res.status(500).json({ error: 'Failed to create workspace' }); }
}

async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id').eq('id', id).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });
    await supabase.from('workspaces').delete().eq('id', id);
    res.json({ message: 'Workspace deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete workspace' }); }
}

async function getDashboard(req, res) {
  try {
    const { workspaceId } = req.params;
    const { data: ws } = await supabase.from('workspaces').select('id, name').eq('id', workspaceId).eq('user_id', req.user.id).single();
    if (!ws) return res.status(404).json({ error: 'Workspace not found' });

    const [docs, messages, tasks, notifications] = await Promise.all([
      supabase.from('documents').select('id, name, size, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('id, role, content, tool_calls, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(50),
      supabase.from('tasks').select('id, title, description, priority, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
      supabase.from('notifications').select('id, title, message, sent, created_at').eq('workspace_id', workspaceId).order('created_at', { ascending: false }).limit(20),
    ]);

    const toolCallLog = messages.data?.filter(m => m.role === 'assistant' && m.tool_calls).flatMap(m => { try { return JSON.parse(m.tool_calls); } catch { return []; } }) || [];

    res.json({ workspace: ws, documents: docs.data || [], chatHistory: messages.data?.reverse() || [], tasks: tasks.data || [], notifications: notifications.data || [], toolCallLog });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
}

module.exports = { getWorkspaces, createWorkspace, deleteWorkspace, getDashboard };