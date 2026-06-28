import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import WorkspaceSwitcher from '../components/WorkspaceSwitcher';
import DocumentUpload from '../components/DocumentUpload';
import ChatWindow from '../components/ChatWindow';
import ToolCallLog from '../components/ToolCallLog';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => { loadWorkspaces(); }, []);
  useEffect(() => { if (activeWorkspace) loadDashboard(); }, [activeWorkspace?.id]);

  const loadWorkspaces = async () => {
    try {
      const data = await api.getWorkspaces();
      setWorkspaces(data.workspaces);
      const saved = localStorage.getItem('activeWorkspaceId');
      const found = data.workspaces.find(w => w.id === saved) || data.workspaces[0];
      setActiveWorkspace(found);
    } catch { navigate('/login'); }
  };

  const loadDashboard = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try { const data = await api.getDashboard(activeWorkspace.id); setDashboard(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSwitch = (ws) => { setActiveWorkspace(ws); localStorage.setItem('activeWorkspaceId', ws.id); setDashboard(null); };
  const logout = () => { localStorage.clear(); navigate('/login'); };

  const tabs = [
    { id: 'chat', label: '💬 Chat' },
    { id: 'docs', label: '📄 Documents' },
    { id: 'tools', label: '🔧 Tool Log' },
  ];

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <aside style={{width:'260px',flexShrink:0,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{flex:1,padding:'20px 16px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:'22px'}}>🧠</span>
            <span style={{fontWeight:'700',fontSize:'16px'}}>DocuMind</span>
          </div>
          <div style={{marginBottom:'20px'}}>
            <p style={{fontSize:'10px',fontWeight:'700',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px'}}>Workspace</p>
            <WorkspaceSwitcher workspaces={workspaces} activeWorkspace={activeWorkspace} onSwitch={handleSwitch} onRefresh={loadWorkspaces} />
          </div>
          <div>
            <p style={{fontSize:'10px',fontWeight:'700',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px'}}>Navigation</p>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',borderRadius:'6px',width:'100%',fontSize:'13px',cursor:'pointer',background:activeTab===tab.id?'var(--surface2)':'transparent',color:activeTab===tab.id?'var(--text)':'var(--text-muted)',border:'none',marginBottom:'4px'}}>
                {tab.label}
                {tab.id==='docs'&&dashboard&&<span style={{marginLeft:'auto',background:'var(--accent)',color:'white',fontSize:'10px',borderRadius:'10px',padding:'1px 6px'}}>{dashboard.documents.length}</span>}
              </button>
            ))}
          </div>
        </div>
        {dashboard && (
          <div style={{padding:'14px 16px',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
            {[['Documents',dashboard.documents.length],['Messages',dashboard.chatHistory.length],['Tasks',dashboard.tasks.length],['Tool calls',dashboard.toolCallLog.length]].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'var(--text-muted)',padding:'3px 0'}}>
                <span>{k}</span><strong style={{color:'var(--text)'}}>{v}</strong>
              </div>
            ))}
          </div>
        )}
        <div style={{padding:'16px',borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'600',fontSize:'14px',flexShrink:0}}>{user.name?.[0]||'U'}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:'13px',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</p>
              <p style={{fontSize:'11px',color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</p>
            </div>
            <button onClick={logout} style={{background:'transparent',color:'var(--text-muted)',border:'none',padding:'6px',cursor:'pointer',borderRadius:'6px',fontSize:'18px'}}>↗</button>
          </div>
        </div>
      </aside>
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--surface)',flexShrink:0}}>
          <div>
            <h2 style={{fontWeight:'600',fontSize:'18px'}}>{tabs.find(t=>t.id===activeTab)?.label}</h2>
            {activeWorkspace&&<p style={{color:'var(--text-muted)',fontSize:'12px',marginTop:'2px'}}>Active: <strong style={{color:'var(--text)'}}>{activeWorkspace.name}</strong></p>}
          </div>
          <button className="btn-ghost" style={{fontSize:'13px'}} onClick={loadDashboard}>↺ Refresh</button>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {loading&&!dashboard?<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%'}}><p style={{color:'var(--text-muted)'}}>Loading…</p></div>:(
            <>
              {activeTab==='chat'&&activeWorkspace&&<ChatWindow workspaceId={activeWorkspace.id} onNewToolCall={loadDashboard} />}
              {activeTab==='docs'&&activeWorkspace&&<div style={{padding:'20px',overflowY:'auto',height:'100%'}}><DocumentUpload workspaceId={activeWorkspace.id} documents={dashboard?.documents||[]} onRefresh={loadDashboard} /></div>}
              {activeTab==='tools'&&<div style={{padding:'20px',overflowY:'auto',height:'100%'}}>
                {dashboard?.tasks.length>0&&<div style={{marginBottom:'24px'}}>
                  <h3 style={{fontSize:'14px',fontWeight:'600',marginBottom:'10px',color:'var(--text-muted)'}}>SAVED TASKS</h3>
                  {dashboard.tasks.map(task=>(
                    <div key={task.id} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'8px',padding:'12px 14px',marginBottom:'8px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                        <p style={{fontWeight:'500',fontSize:'13px'}}>{task.title}</p>
                        <span className={`badge badge-${task.priority==='high'?'danger':task.priority==='medium'?'warning':'info'}`}>{task.priority}</span>
                      </div>
                      <p style={{fontSize:'12px',color:'var(--text-muted)'}}>{task.description}</p>
                    </div>
                  ))}
                </div>}
                <h3 style={{fontSize:'14px',fontWeight:'600',marginBottom:'10px',color:'var(--text-muted)'}}>TOOL CALL HISTORY</h3>
                <ToolCallLog toolCalls={dashboard?.toolCallLog||[]} />
              </div>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}