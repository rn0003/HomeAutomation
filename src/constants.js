export const ICONS = {
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  switch: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><rect x="10" y="6" width="4" height="6" rx="1"/>',
  plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v5"/>',
  thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 10v6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.7-1.5"/>',
  blinds: '<path d="M3 3h18M5 3v18M19 3v18M5 7h14M5 11h14M5 15h14M12 15v4"/>',
  fan: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2C11 6 12 3 15 3c2 0 2.4 2.6.3 4.4zM13.8 12c4.2-1 7.2 0 7.2 3 0 2-2.6 2.4-4.4.3zM12 13.8c1 4.2 0 7.2-3 7.2-2 0-2.4-2.6-.3-4.4zM10.2 12C6 13 3 12 3 9c0-2 2.6-2.4 4.4-.3z"/>',
  speaker: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><circle cx="12" cy="14" r="3.6"/><circle cx="12" cy="6.5" r="1"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  home: '<path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M8 5l2 4M14 5l2 4"/>',
  away: '<path d="M3 21h18M6 21V4h9v17M15 4l4 2v15M12 12v1"/>',
  power: '<path d="M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  box: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
};

export const TYPES = {
  switch: { label: 'Light switch', icon: 'switch', light: true },
  dimmer: { label: 'Dimmable light', icon: 'bulb', light: true },
  plug: { label: 'Smart plug', icon: 'plug' },
  fan: { label: 'Fan', icon: 'fan' },
  blinds: { label: 'Blinds', icon: 'blinds' },
  speaker: { label: 'Speaker', icon: 'speaker' },
  lock: { label: 'Door lock', icon: 'lock' },
  thermostat: { label: 'Thermostat', icon: 'thermo' },
};

export const DEFAULTS = {
  switch: { on: false },
  dimmer: { on: false, level: 70 },
  plug: { on: false, watts: 60 },
  fan: { on: false, speed: 2 },
  blinds: { level: 0 },
  speaker: { on: false, volume: 30 },
  lock: { locked: true },
  thermostat: { current: 70, target: 70, mode: 'heat' },
};

export const SUGGEST = {
  switch: 'g-light',
  dimmer: 'g-light',
  fan: 'g-climate',
  blinds: 'g-climate',
  thermostat: 'g-climate',
  lock: 'g-sec',
  speaker: 'g-media',
};

export const GROUP_ICONS = ['bulb', 'thermo', 'shield', 'music', 'plug', 'home', 'spark', 'moon', 'sun', 'box'];

export const MASTER_TYPES = ['switch', 'dimmer', 'plug', 'fan', 'speaker'];

export const SPEEDS = ['Low', 'Medium', 'High'];

export const SCENES = [
  { id: 'morning', name: 'Good morning', icon: 'sun' },
  { id: 'movie', name: 'Movie night', icon: 'film' },
  { id: 'away', name: 'Away', icon: 'away' },
  { id: 'night', name: 'Good night', icon: 'moon' },
];

export function seed() {
  return {
    groups: [
      { id: 'g-light', name: 'Lighting', icon: 'bulb' },
      { id: 'g-climate', name: 'Climate', icon: 'thermo' },
      { id: 'g-sec', name: 'Security', icon: 'shield' },
      { id: 'g-media', name: 'Media', icon: 'music' },
    ],
    devices: [
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
    ],
  };
}

export function isActive(d) {
  if (d.type === 'blinds') return d.level > 0;
  if (d.type === 'lock') return !d.locked;
  if (d.type === 'thermostat') return d.mode !== 'off';
  return !!d.on;
}

export function tone(d) {
  if (d.type === 'lock') return d.locked ? 'ok' : 'alert';
  if (d.type === 'thermostat') return d.mode === 'heat' ? 'warm' : d.mode === 'cool' ? 'cool' : 'off';
  if (d.type === 'blinds' || d.type === 'fan') return isActive(d) ? 'cool' : 'off';
  return d.on ? 'warm' : 'off';
}

export function stateText(d) {
  switch (d.type) {
    case 'switch': return d.on ? 'On' : 'Off';
    case 'dimmer': return d.on ? `On · ${d.level}%` : 'Off';
    case 'plug': return d.on ? `On · ${d.watts} W` : 'Off';
    case 'fan': return d.on ? `On · ${SPEEDS[d.speed - 1]}` : 'Off';
    case 'blinds': return d.level === 0 ? 'Closed' : d.level === 100 ? 'Open' : `${d.level}% open`;
    case 'speaker': return d.on ? `Playing · vol ${d.volume}` : 'Paused';
    case 'lock': return d.locked ? 'Locked' : 'Unlocked';
    case 'thermostat': return d.mode === 'off' ? 'Off' : `${d.mode === 'heat' ? 'Heating' : 'Cooling'} to ${d.target}°`;
    default: return '';
  }
}

export function iconFor(d) {
  return d.type === 'lock' && !d.locked ? 'unlock' : TYPES[d.type].icon;
}

export function masterFor(devs) {
  const locks = devs.filter((d) => d.type === 'lock');
  const tg = devs.filter((d) => MASTER_TYPES.includes(d.type));
  if (locks.length && locks.length >= tg.length) {
    return locks.some((d) => !d.locked) ? { label: 'Lock all', act: 'lockall' } : null;
  }
  if (!tg.length) return null;
  return tg.some((d) => d.on) ? { label: 'Turn all off', act: 'alloff' } : { label: 'Turn all on', act: 'allon' };
}

export const uid = (p) => p + Math.random().toString(36).slice(2, 8);
