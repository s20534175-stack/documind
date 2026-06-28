import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'16px',padding:'40px',width:'100%',maxWidth:'420px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
          <span style={{fontSize:'32px'}}>🧠</span>
          <h1 style={{fontSize:'24px',fontWeight:'700'}}>DocuMind</h1>
        </div>
        <p style={{color:'var(--text-muted)',marginBottom:'28px',fontSize:'14px'}}>Create your account</p>
        {error && <div style={{background:'#ef444420',border:'1px solid #ef4444',color:'#ef4444',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'18px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            <label style={{fontSize:'13px',fontWeight:'500',color:'var(--text-muted)'}}>Full Name</label>
            <input type="text" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            <label style={{fontSize:'13px',fontWeight:'500',color:'var(--text-muted)'}}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            <label style={{fontSize:'13px',fontWeight:'500',color:'var(--text-muted)'}}>Password</label>
            <input type="password" placeholder="At least 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary" style={{width:'100%',padding:'12px'}} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'var(--text-muted)'}}>
          Already have an account? <Link to="/login" style={{color:'var(--accent)',textDecoration:'none',fontWeight:'500'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}