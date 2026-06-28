import { useState, useRef } from 'react';
import { api } from '../api/client';

export default function DocumentUpload({ workspaceId, documents, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(file.type)) { setUploadError('Only PDF and TXT files are supported.'); return; }
    setUploading(true); setUploadError(''); setUploadSuccess('');
    try {
      const data = await api.uploadDocument(workspaceId, file);
      setUploadSuccess(`"${data.document.name}" indexed — ${data.document.chunkCount} chunks`);
      await onRefresh();
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) { setUploadError(err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try { await api.deleteDocument(workspaceId, doc.id); await onRefresh(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
      <div
        style={{border:`2px dashed ${dragOver?'var(--accent)':'var(--border)'}`,borderRadius:'10px',padding:'28px 20px',display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',transition:'all 0.2s',background:dragOver?'#6366f110':'var(--surface2)'}}
        onDragOver={e=>{e.preventDefault();setDragOver(true);}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
        onClick={()=>fileRef.current.click()}
      >
        <span style={{fontSize:'24px'}}>📤</span>
        <p style={{color:'var(--text-muted)',fontSize:'13px',marginTop:'8px'}}>
          {uploading?'Uploading and indexing…':'Drop a PDF or TXT here, or click to browse'}
        </p>
        <input ref={fileRef} type="file" accept=".pdf,.txt" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])} />
      </div>
      {uploadSuccess&&<div style={{background:'#10b98120',border:'1px solid var(--success)',color:'var(--success)',padding:'8px 12px',borderRadius:'8px',fontSize:'12px'}}>✓ {uploadSuccess}</div>}
      {uploadError&&<div style={{background:'#ef444420',border:'1px solid var(--danger)',color:'var(--danger)',padding:'8px 12px',borderRadius:'8px',fontSize:'12px'}}>⚠ {uploadError}</div>}
      {documents.length===0?(
        <p style={{color:'var(--text-muted)',fontSize:'13px',textAlign:'center',padding:'12px'}}>No documents yet. Upload one above.</p>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {documents.map(doc=>(
            <div key={doc.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'var(--surface2)',borderRadius:'8px',border:'1px solid var(--border)'}}>
              <span style={{fontSize:'16px'}}>📄</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'13px',fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.name}</p>
                <p style={{fontSize:'11px',color:'var(--text-muted)'}}>{(doc.size/1024).toFixed(1)} KB · {new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={()=>handleDelete(doc)} style={{background:'transparent',color:'var(--text-muted)',border:'none',cursor:'pointer',padding:'4px',borderRadius:'4px',flexShrink:0}}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}