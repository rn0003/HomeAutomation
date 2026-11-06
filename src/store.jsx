import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { seed, TYPES, DEFAULTS, MASTER_TYPES, SUGGEST, uid } from './constants';

const KEY = 'home-panel-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.devices)) return parsed;
  } catch (_) {}
  return seed();
}

function persist(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {}
}

const initialUI = {
  filter: 'all',
  editing: false,
  sheet: null,
  toast: null,
};

function reducer(state, action) {
  const { data, devices, groups } = state;
  const dev = (id) => data.devices.find((d) => d.id === id);
  const grp = (id) => data.groups.find((g) => g.id === id);

  switch (action.type) {
    case 'TOGGLE': {
      const d = dev(action.id);
      if (!d) return state;
      const next = { ...d };
      switch (d.type) {
        case 'blinds': next.level = d.level > 0 ? 0 : 100; break;
        case 'lock': next.locked = !d.locked; break;
        case 'thermostat': return { ...state, ui: { ...state.ui, sheet: { kind: 'control', id: d.id } } };
        default: next.on = !d.on;
      }
      const newDevices = data.devices.map((x) => x.id === d.id ? next : x);
      const newData = { ...data, devices: newDevices };
      persist(newData);
      return { ...state, data: newData };
    }

    case 'UPDATE_DEVICE': {
      const newDevices = data.devices.map((x) => x.id === action.id ? { ...x, ...action.changes } : x);
      const newData = { ...data, devices: newDevices };
      persist(newData);
      return { ...state, data: newData };
    }

    case 'ADD_DEVICE': {
      const d = { id: uid('d'), ...action.device, ...structuredClone(DEFAULTS[action.device.type]) };
      const newData = { ...data, devices: [...data.devices, d] };
      persist(newData);
      let filter = state.ui.filter;
      if (filter !== 'all' && filter !== (d.group ?? 'none')) filter = 'all';
      return {
        ...state,
        data: newData,
        ui: { ...state.ui, filter, sheet: null, toast: { message: `Added ${d.name} to ${grp(d.group)?.name || 'Other'}` } },
        flashId: d.id,
      };
    }

    case 'SAVE_DEVICE': {
      const newDevices = data.devices.map((x) => x.id === action.id ? { ...x, ...action.changes } : x);
      const newData = { ...data, devices: newDevices };
      persist(newData);
      return {
        ...state,
        data: newData,
        ui: { ...state.ui, sheet: null, toast: { message: `Saved ${action.changes.name}` } },
        flashId: action.id,
      };
    }

    case 'REMOVE_DEVICE': {
      const d = dev(action.id);
      if (!d) return state;
      const snapshot = JSON.stringify(data);
      const newData = { ...data, devices: data.devices.filter((x) => x.id !== d.id) };
      persist(newData);
      return {
        ...state,
        data: newData,
        ui: { ...state.ui, sheet: null, toast: { message: `Removed ${d.name}`, undo: snapshot } },
      };
    }

    case 'MASTER_ACTION': {
      const snapshot = JSON.stringify(data);
      const gid = action.groupId;
      const devs = data.devices.filter((x) => x.group === gid);
      let newDevices = [...data.devices];
      if (action.act === 'lockall') {
        newDevices = newDevices.map((x) => x.group === gid && x.type === 'lock' ? { ...x, locked: true } : x);
      } else {
        const on = action.act === 'allon';
        newDevices = newDevices.map((x) => x.group === gid && MASTER_TYPES.includes(x.type) ? { ...x, on } : x);
      }
      const newData = { ...data, devices: newDevices };
      persist(newData);
      const gname = grp(gid)?.name || 'Other';
      const msg = action.act === 'lockall'
        ? `${gname}: all doors locked`
        : `${gname}: everything turned ${action.act === 'allon' ? 'on' : 'off'}`;
      return { ...state, data: newData, ui: { ...state.ui, toast: { message: msg, undo: snapshot } } };
    }

    case 'SCENE': {
      const snapshot = JSON.stringify(data);
      const newDevices = data.devices.map((d) => ({ ...d }));
      const L = () => newDevices.filter((d) => TYPES[d.type]?.light);
      const by = (t) => newDevices.filter((d) => d.type === t);
      let msg = '';

      if (action.id === 'morning') {
        L().forEach((d) => { if (d.room !== 'Outside') { d.on = true; if (d.type === 'dimmer') d.level = 70; } else d.on = false; });
        by('blinds').forEach((d) => d.level = 100);
        by('thermostat').forEach((d) => { d.mode = 'heat'; d.target = 70; });
        msg = 'Good morning: lights at 70%, blinds open, heat to 70°';
      } else if (action.id === 'movie') {
        L().forEach((d) => { if (d.room === 'Living room' && d.type === 'dimmer') { d.on = true; d.level = 15; } else d.on = false; });
        by('blinds').forEach((d) => d.level = 0);
        newDevices.filter((d) => d.type === 'plug' && /tv/i.test(d.name)).forEach((d) => d.on = true);
        by('speaker').forEach((d) => d.on = false);
        msg = 'Movie night: living room dimmed to 15%, blinds closed';
      } else if (action.id === 'away' || action.id === 'night') {
        L().forEach((d) => d.on = (action.id === 'night' && d.room === 'Outside'));
        by('lock').forEach((d) => d.locked = true);
        by('speaker').forEach((d) => d.on = false);
        by('fan').forEach((d) => d.on = false);
        by('thermostat').forEach((d) => { if (d.mode !== 'off') d.target = action.id === 'away' ? 62 : 66; });
        if (action.id === 'night') by('blinds').forEach((d) => d.level = 0);
        msg = action.id === 'away'
          ? 'Away: lights off, doors locked, heat down to 62°'
          : 'Good night: doors locked, porch light on, heat to 66°';
      }

      const newData = { ...data, devices: newDevices };
      persist(newData);
      return { ...state, data: newData, ui: { ...state.ui, toast: { message: msg, undo: snapshot } } };
    }

    case 'ADD_GROUP': {
      const g = { id: uid('g'), name: action.name, icon: action.icon };
      const newData = { ...data, groups: [...data.groups, g] };
      persist(newData);
      return {
        ...state,
        data: newData,
        ui: { ...state.ui, filter: g.id, sheet: null, toast: { message: `Created ${g.name}. Add devices to it from here.` } },
      };
    }

    case 'SAVE_GROUP': {
      const newGroups = data.groups.map((g) => g.id === action.id ? { ...g, name: action.name, icon: action.icon } : g);
      const newData = { ...data, groups: newGroups };
      persist(newData);
      return { ...state, data: newData, ui: { ...state.ui, sheet: null, toast: { message: `Saved ${action.name}` } } };
    }

    case 'DELETE_GROUP': {
      const g = grp(action.id);
      if (!g) return state;
      const snapshot = JSON.stringify(data);
      const n = data.devices.filter((x) => x.group === g.id).length;
      const newDevices = data.devices.map((x) => x.group === g.id ? { ...x, group: null } : x);
      const newGroups = data.groups.filter((y) => y.id !== g.id);
      const newData = { ...data, devices: newDevices, groups: newGroups };
      persist(newData);
      let filter = state.ui.filter === g.id ? 'all' : state.ui.filter;
      const msg = n
        ? `Deleted ${g.name}. Its ${n} ${n === 1 ? 'device moved' : 'devices moved'} to Other.`
        : `Deleted ${g.name}`;
      return { ...state, data: newData, ui: { ...state.ui, filter, sheet: null, toast: { message: msg, undo: snapshot } } };
    }

    case 'UNDO': {
      if (!state.ui.toast?.undo) return state;
      const restored = JSON.parse(state.ui.toast.undo);
      persist(restored);
      return { ...state, data: restored, ui: { ...state.ui, sheet: null, toast: { message: 'Undone' } } };
    }

    case 'RESET': {
      const fresh = seed();
      persist(fresh);
      return { ...state, data: fresh, ui: { ...state.ui, filter: 'all', toast: { message: 'Example home restored' } } };
    }

    case 'SET_FILTER':
      return { ...state, ui: { ...state.ui, filter: action.filter } };

    case 'TOGGLE_EDITING':
      return { ...state, ui: { ...state.ui, editing: !state.ui.editing } };

    case 'OPEN_SHEET':
      return { ...state, ui: { ...state.ui, sheet: action.sheet } };

    case 'CLOSE_SHEET':
      return { ...state, ui: { ...state.ui, sheet: null } };

    case 'DISMISS_TOAST':
      return { ...state, ui: { ...state.ui, toast: null } };

    case 'CLEAR_FLASH':
      return { ...state, flashId: null };

    default:
      return state;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    data: loadState(),
    ui: initialUI,
    flashId: null,
  }));

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
