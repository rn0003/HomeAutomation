import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'home_panel';
const JWT_SECRET = process.env.JWT_SECRET || 'home-panel-jwt-secret-change-in-prod';
const SALT_ROUNDS = 12;

app.use(express.json());

let db;

const uid = (p) => p + Math.random().toString(36).slice(2, 8);

const SEED_GROUPS = [
  { id: 'g-light', name: 'Lighting', icon: 'bulb' },
  { id: 'g-climate', name: 'Climate', icon: 'thermo' },
  { id: 'g-sec', name: 'Security', icon: 'shield' },
  { id: 'g-media', name: 'Media', icon: 'music' },
];

const SEED_DEVICES = [
  { id: 'd1', type: 'dimmer', name: 'Ceiling light', room: 'Living room', group: 'g-light', on: true, level: 80 },
  { id: 'd2', type: 'dimmer', name: 'Pendants', room: 'Kitchen', group: 'g-light', on: true, level: 60 },
  { id: 'd3', type: 'switch', name: 'Hallway light', room: 'Hallway', group: 'g-light', on: false },
  { id: 'd4', type: 'switch', name: 'Porch light', room: 'Outside', group: 'g-light', on: true },
  { id: 'd5', type: 'dimmer', name: 'Bedside lamp', room: 'Bedroom', group: 'g-light', on: false, level: 40 },
  { id: 'd6', type: 'thermostat', name: 'Thermostat', room: 'Hallway', group: 'g-climate', current: 68, target: 70, mode: 'heat' },
  { id: 'd7', type: 'fan', name: 'Ceiling fan', room: 'Bedroom', group: 'g-climate', on: false, speed: 2 },
  { id: 'd8', type: 'blinds', name: 'Blinds', room: 'Living room', group: 'g-climate', level: 100 },
  { id: 'd9', type: 'lock', name: 'Front door', room: 'Entry', group: 'g-sec', locked: true },
  { id: 'd10', type: 'lock', name: 'Back door', room: 'Kitchen', group: 'g-sec', locked: false },
  { id: 'd11', type: 'speaker', name: 'Speaker', room: 'Living room', group: 'g-media', on: true, volume: 35 },
  { id: 'd12', type: 'plug', name: 'TV', room: 'Living room', group: 'g-media', on: true, watts: 84 },
  { id: 'd13', type: 'plug', name: 'Coffee maker', room: 'Kitchen', group: null, on: false, watts: 900 },
];

const strip = (docs) => docs.map(({ _id, userId, ...rest }) => rest);

function signToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

async function seedForUser(userId) {
  await db.collection('groups').insertMany(SEED_GROUPS.map((g) => ({ ...g, userId })));
  await db.collection('devices').insertMany(SEED_DEVICES.map((d) => ({ ...d, userId })));
}

// ── Auth routes (no token required) ──

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = {
    id: uid('u'),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date(),
  };
  await db.collection('users').insertOne({ ...user });
  await seedForUser(user.id);

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ── Auth middleware (all /api routes below require a valid token) ──

app.use('/api', (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// ── Data routes (user-scoped) ──

app.get('/api/state', async (req, res) => {
  const [groups, devices] = await Promise.all([
    db.collection('groups').find({ userId: req.userId }).toArray(),
    db.collection('devices').find({ userId: req.userId }).toArray(),
  ]);
  res.json({ groups: strip(groups), devices: strip(devices) });
});

app.put('/api/state', async (req, res) => {
  const { groups, devices } = req.body;
  await db.collection('groups').deleteMany({ userId: req.userId });
  await db.collection('devices').deleteMany({ userId: req.userId });
  if (groups.length)
    await db.collection('groups').insertMany(groups.map((g) => ({ ...g, userId: req.userId })));
  if (devices.length)
    await db.collection('devices').insertMany(devices.map((d) => ({ ...d, userId: req.userId })));
  res.json({ groups, devices });
});

app.patch('/api/devices/:id', async (req, res) => {
  await db.collection('devices').updateOne({ id: req.params.id, userId: req.userId }, { $set: req.body });
  const doc = await db.collection('devices').findOne({ id: req.params.id, userId: req.userId });
  if (!doc) return res.status(404).json({ error: 'not found' });
  const { _id, userId, ...device } = doc;
  res.json(device);
});

app.post('/api/devices', async (req, res) => {
  const device = { ...req.body, userId: req.userId };
  await db.collection('devices').insertOne({ ...device });
  const { userId, _id, ...clean } = device;
  res.status(201).json(clean);
});

app.delete('/api/devices/:id', async (req, res) => {
  await db.collection('devices').deleteOne({ id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

app.post('/api/groups', async (req, res) => {
  const group = { ...req.body, userId: req.userId };
  await db.collection('groups').insertOne({ ...group });
  const { userId, _id, ...clean } = group;
  res.status(201).json(clean);
});

app.patch('/api/groups/:id', async (req, res) => {
  await db.collection('groups').updateOne({ id: req.params.id, userId: req.userId }, { $set: req.body });
  const doc = await db.collection('groups').findOne({ id: req.params.id, userId: req.userId });
  if (!doc) return res.status(404).json({ error: 'not found' });
  const { _id, userId, ...group } = doc;
  res.json(group);
});

app.delete('/api/groups/:id', async (req, res) => {
  await db.collection('devices').updateMany(
    { group: req.params.id, userId: req.userId },
    { $set: { group: null } }
  );
  await db.collection('groups').deleteOne({ id: req.params.id, userId: req.userId });
  res.json({ ok: true });
});

// ── Static files (production) ──

app.use(express.static(join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

async function start() {
  const client = await MongoClient.connect(MONGO_URL);
  db = client.db(DB_NAME);

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('devices').createIndex({ userId: 1 });
  await db.collection('groups').createIndex({ userId: 1 });

  app.listen(PORT, () => {
    console.log(`Home Panel API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
