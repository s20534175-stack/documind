import { useState } from 'react';
import { api } from '../api/client';

export default function WorkspaceSwitcher({ workspaces, activeWorkspace, onSwitch, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const data = await api.createWorkspace(newName.trim());
      setNewName(''); setShowInput(false);
      await onRefresh();
      onSwitch(data.workspace);
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  };

  const handleDelete = async (ws, e) => {
    e.stopPropagation();
    if (workspaces.length === 1) return alert("Can't delete your only workspace.");
    if (!confirm(`Delete "${ws.name}"?`)) return;
    try { await api.deleteWorkspace(ws.id); await onRefresh(); if (activeWorkspace?.id === ws.id) onSwitch(workspaces.find(w => w.id !== ws.id)); }
    catch (err) { alert(err.message); }
  };

  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(!open)} style={{display:'flex',alignItems:'center',gap:'8px',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'8px 12px',width:'100%',color:'var(--text)',cursor:'pointer'}}>
        <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--accent)',flexShrink:0}} />
        <span style={{fontWeight:600,fontSize:'14px',flex:1,textAlign:'left'}}>{activeWorkspace?.name||'Select workspace'}</span>
        <span>▾</span>
      </button>
      {open && (
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,right:0,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px',zIndex:100,boxShadow:'0 8px 30px rgba(0,0,0,0.4)',padding:'6px',minWidth:'220px'}}>
          {workspaces.map(ws => (
            <div key={ws.id} onClick={() => { onSwitch(ws); setOpen(false); }}
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',borderRadius:'6px',cursor:'pointer',background:activeWorkspace?.id===ws.id?'var(--surface2)':'transparent'}}>
              <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--accent)',flexShrink:0}} />
              <span style={{flex:1,fontSize:'13px'}}>{ws.name}</span>
              {activeWorkspace?.id===ws.id&&<span style={{fontSize:'10px',padding:'2px 6px',background:'var(--accent)',color:'white',borderRadius:'4px'}}>Active</span>}
              {workspaces.length>1&&<button onClick={(e)=>handleDelete(ws,e)} style={{background:'transparent',color:'var(--text-muted)',border:'none',padding:'2px',cursor:'pointer',borderRadius:'4px'}}>🗑</button>}
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--border)',marginTop:'6px',paddingTop:'6px'}}>
            {showInput ? (
              <form onSubmit={handleCreate} style={{padding:'6px 8px',display:'flex',gap:'6px'}}>
                <input autoFocus placeholder="Workspace name" value={newName} onChange={e=>setNewName(e.target.value)} style={{fontSize:'13px',padding:'6px 10px'}} />
                <button type="submit" className="btn-primary" style={{padding:'6px 12px',fontSize:'12px'}} disabled={creating}>{creating?'…':'Add'}</button>
              </form>
            ) : (
              <button onClick={() => setShowInput(true)} style={{display:'flex',alignItems:'center',gap:'6px',background:'transparent',color:'var(--text-muted)',border:'none',padding:'8px 10px',cursor:'pointer',fontSize:'13px',width:'100%',borderRadius:'6px'}}>
                + New workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}