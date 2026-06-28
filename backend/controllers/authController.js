const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../db/supabase');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const { error: userError } = await supabase.from('users').insert({
      id: userId, name, email: email.toLowerCase(), password_hash: hashedPassword, created_at: new Date().toISOString(),
    });
    if (userError) throw new Error(userError.message);

    const workspaceId = uuidv4();
    await supabase.from('workspaces').insert({
      id: workspaceId, user_id: userId, name: 'My Workspace', created_at: new Date().toISOString(),
    });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: userId, name, email: email.toLowerCase() }, defaultWorkspaceId: workspaceId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data: user } = await supabase.from('users').select('id, name, email, password_hash').eq('email', email.toLowerCase()).single();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };