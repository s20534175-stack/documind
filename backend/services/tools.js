const supabase = require('../db/supabase');
const { v4: uuidv4 } = require('uuid');

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'save_task',
      description: 'Save a task or action item to the current workspace.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Short title of the task' },
          description: { type: 'string', description: 'Detailed description' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Priority level' },
        },
        required: ['title', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_notification',
      description: 'Send a summary or notification to the team Discord channel.',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'The message to send' },
          title: { type: 'string', description: 'Optional title' },
        },
        required: ['message'],
      },
    },
  },
];

async function executeTool(workspaceId, userId, toolName, toolArgs) {
  const knownTools = TOOL_DEFINITIONS.map(t => t.function.name);
  if (!knownTools.includes(toolName)) return { result: `Unknown tool: ${toolName}`, success: false };

  try {
    if (toolName === 'save_task') {
      const { title, description, priority = 'medium' } = toolArgs;
      if (!title || !description) return { result: 'Missing required fields', success: false };
      const { data, error } = await supabase.from('tasks').insert({ id: uuidv4(), workspace_id: workspaceId, user_id: userId, title: title.slice(0, 255), description, priority, created_at: new Date().toISOString() }).select().single();
      if (error) throw new Error(error.message);
      return { result: `Task "${title}" saved with ${priority} priority.`, success: true, data };
    }

    if (toolName === 'send_notification') {
      const { message, title = 'Workspace Notification' } = toolArgs;
      if (!message) return { result: 'Missing required field: message', success: false };
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      await supabase.from('notifications').insert({ id: uuidv4(), workspace_id: workspaceId, user_id: userId, title, message, sent: !!webhookUrl, created_at: new Date().toISOString() });
      if (webhookUrl) {
        await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [{ title, description: message, color: 0x5865f2 }] }) });
      }
      return { result: `Notification "${title}" sent successfully.`, success: true };
    }
  } catch (err) {
    return { result: `Tool execution failed: ${err.message}`, success: false };
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool };