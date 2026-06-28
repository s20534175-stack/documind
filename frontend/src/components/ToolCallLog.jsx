import { useState } from 'react';

export default function ToolCallLog({ toolCalls }) {
  const [expanded, setExpanded] = useState(null);

  if (!toolCalls || toolCalls.length === 0) {
    return <p style={{color:'var(--text-muted)',fontSize:'13px',textAlign:'center',padding:'12px'}}>No tool calls yet. Ask the assistant to save a task or notify the team.</p>;
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {toolCalls.map((call, i) => (
        <div key={i} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',cursor:'pointer'}} onClick={()=>setExpanded(expanded===i?null:i)}>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <span>🔧</span>
              <span style={{fontFamily:'monospace',fontSize:'13px',fontWeight:'600'}}>{call.tool_name}()</span>
              <span>{call.success?'✅':'❌'}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{fontSize:'11px',color:'var(--text-muted)'}}>{call.timestamp?new Date(call.timestamp).toLocaleTimeString():''}</span>
              <span style={{color:'var(--text-muted)'}}>{expanded===i?'▴':'▾'}</span>
            </div>
          </div>
          {expanded===i&&(
            <div style={{padding:'10px 12px',borderTop:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div>
                <p style={{fontSize:'10px',fontWeight:'600',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'4px'}}>Arguments</p>
                <pre style={{background:'var(--surface)',padding:'8px 10px',borderRadius:'6px',fontSize:'11px',fontFamily:'monospace',overflow:'auto',color:'var(--text)'}}>{JSON.stringify(call.arguments,null,2)}</pre>
              </div>
              <div>
                <p style={{fontSize:'10px',fontWeight:'600',color:'var(--text-muted)',textTransform:'uppercase',marginBottom:'4px'}}>Result</p>
                <p style={{fontSize:'12px',color:call.success?'var(--success)':'var(--danger)'}}>{call.result}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}