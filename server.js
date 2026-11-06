import express from 'express';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'home_panel';

app.use(express.json());

let db;

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

const strip = (docs) => docs.map(({ _id, ...rest }) => rest);

async function ensureSeeded() {
  const count = await db.collection('devices').countDocuments();
  if (count === 0) {
    await db.collection('groups').insertMany(SEED_GROUPS.map((g) => ({ ...g })));
    await db.collection('devices').insertMany(SEED_DEVICES.map((d) => ({ ...d })));
    console.log('Database seeded with example devices');
  }
}

// GET full state
app.get('/api/state', async (_req, res) => {
  const [groups, devices] = await Promise.all([
    db.collection('groups').find({}).toArray(),
    db.collection('devices').find({}).toArray(),
  ]);
  res.json({ groups: strip(groups), devices: strip(devices) });
});

// PUT full state (bulk replace — used by scenes, reset, undo)
app.put('/api/state', async (req, res) => {
  const { groups, devices } = req.body;
  await db.collection('groups').deleteMany({});
  await db.collection('devices').deleteMany({});
  if (groups.length) await db.collection('groups').insertMany(groups.map((g) => ({ ...g })));
  if (devices.length) await db.collection('devices').insertMany(devices.map((d) => ({ ...d })));
  res.json({ groups, devices });
});

// PATCH single device
app.patch('/api/devices/:id', async (req, res) => {
  await db.collection('devices').updateOne({ id: req.params.id }, { $set: req.body });
  const doc = await db.collection('devices').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  const { _id, ...device } = doc;
  res.json(device);
});

// POST new device
app.post('/api/devices', async (req, res) => {
  await db.collection('devices').insertOne({ ...req.body });
  const { _id, ...device } = req.body;
  res.status(201).json(device);
});

// DELETE device
app.delete('/api/devices/:id', async (req, res) => {
  await db.collection('devices').deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

// POST new group
app.post('/api/groups', async (req, res) => {
  await db.collection('groups').insertOne({ ...req.body });
  const { _id, ...group } = req.body;
  res.status(201).json(group);
});

// PATCH group
app.patch('/api/groups/:id', async (req, res) => {
  await db.collection('groups').updateOne({ id: req.params.id }, { $set: req.body });
  const doc = await db.collection('groups').findOne({ id: req.params.id });
  if (!doc) return res.status(404).json({ error: 'not found' });
  const { _id, ...group } = doc;
  res.json(group);
});

// DELETE group — moves its devices to group: null
app.delete('/api/groups/:id', async (req, res) => {
  await db.collection('devices').updateMany({ group: req.params.id }, { $set: { group: null } });
  await db.collection('groups').deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

// Static files (production)
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

async function start() {
  const client = await MongoClient.connect(MONGO_URL);
  db = client.db(DB_NAME);
  await ensureSeeded();
  app.listen(PORT, () => {
    console.log(`Home Panel API running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
