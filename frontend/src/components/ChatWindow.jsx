import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function ChatWindow({ workspaceId, onNewToolCall }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef();

  useEffect(() => { loadHistory(); }, [workspaceId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadHistory = async () => {
    setLoadingHistory(true); setMessages([]);
    try {
      const data = await api.getChatHistory(workspaceId);
      const parsed = (data.messages || []).map(m => ({ ...m, tool_calls: m.tool_calls ? JSON.parse(m.tool_calls) : [] }));
      setMessages(parsed);
    } catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text, id: Date.now() }]);
    setInput(''); setLoading(true);
    try {
      const data = await api.chat(workspaceId, text);
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources || [], tool_calls: data.toolCalls || [], id: Date.now() + 1 }]);
      if (data.toolCalls?.length > 0 && onNewToolCall) onNewToolCall();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, id: Date.now() + 1, error: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column'}}>
        {loadingHistory&&<div style={{display:'flex',justifyContent:'center',padding:'20px'}}><p style={{color:'var(--text-muted)'}}>Loading chat history…</p></div>}
        {!loadingHistory&&messages.length===0&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,paddingTop:'60px'}}>
            <span style={{fontSize:'40px'}}>🤖</span>
            <p style={{color:'var(--text-muted)',marginTop:'10px',textAlign:'center',fontSize:'14px'}}>Ask me anything about your uploaded documents.<br/><span style={{fontSize:'12px',opacity:0.7}}>I'll cite my sources and say "I don't know" if it's not in your docs.</span></p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id||i} style={{marginBottom:'16px'}}>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-start',flexDirection:msg.role==='user'?'row-reverse':'row'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:msg.role==='user'?'var(--accent)':'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'14px'}}>{msg.role==='user'?'👤':'🤖'}</div>
              <div style={{padding:'12px 16px',borderRadius:'12px',maxWidth:'80%',background:msg.role==='user'?'var(--accent)':msg.error?'#ef444420':'var(--surface2)',border:msg.error?'1px solid var(--danger)':'1px solid var(--border)',display:'flex',flexDirection:'column',gap:'8px'}}>
                <p style={{fontSize:'14px',lineHeight:'1.6',whiteSpace:'pre-wrap'}}>{msg.content}</p>
                {msg.sources?.length>0&&(
                  <div style={{marginTop:'4px',paddingTop:'8px',borderTop:'1px solid var(--border)'}}>
                    <p style={{fontSize:'10px',color:'var(--text-muted)',fontWeight:'600',textTransform:'uppercase',marginBottom:'6px'}}>📚 Sources</p>
                    {msg.sources.map((s,j)=>(
                      <p key={j} style={{fontSize:'11px',color:'var(--text-muted)',padding:'2px 0'}}>{s.document_name} · chunk {s.chunk_index}{s.similarity&&` · ${(s.similarity*100).toFixed(0)}%`}</p>
                    ))}
                  </div>
                )}
                {msg.tool_calls?.length>0&&(
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'4px'}}>
                    {msg.tool_calls.map((tc,j)=>(
                      <span key={j} style={{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'11px',padding:'2px 8px',background:'#6366f120',color:'var(--accent-hover)',borderRadius:'4px'}}>🔧 {tc.tool_name}() {tc.success?'✅':'❌'}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>🤖</div>
            <div style={{padding:'12px 16px',borderRadius:'12px',background:'var(--surface2)',border:'1px solid var(--border)'}}>
              <p style={{color:'var(--text-muted)',fontSize:'14px'}}>Thinking…</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} style={{display:'flex',gap:'10px',padding:'14px 20px',borderTop:'1px solid var(--border)',background:'var(--surface)'}}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about your documents, or ask me to save a task…" disabled={loading} style={{flex:1}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend(e);}}} />
        <button type="submit" className="btn-primary" disabled={loading||!input.trim()} style={{padding:'10px 16px'}}>Send</button>
      </form>
    </div>
  );
}