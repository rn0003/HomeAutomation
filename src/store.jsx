import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { seed, TYPES, DEFAULTS, MASTER_TYPES, uid } from './constants';
import { api } from './api';

const initialUI = {
  filter: 'all',
  editing: false,
  sheet: null,
  toast: null,
};

function reducer(state, action) {
  const { data } = state;
  const dev = (id) => data.devices.find((d) => d.id === id);
  const grp = (id) => data.groups.find((g) => g.id === id);

  switch (action.type) {
    case 'SET_DATA':
      return { ...state, data: action.data, loading: false };

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
      return { ...state, data: { ...data, devices: newDevices } };
    }

    case 'UPDATE_DEVICE': {
      const newDevices = data.devices.map((x) => x.id === action.id ? { ...x, ...action.changes } : x);
      return { ...state, data: { ...data, devices: newDevices } };
    }

    case 'ADD_DEVICE': {
      const d = { id: uid('d'), ...action.device, ...structuredClone(DEFAULTS[action.device.type]) };
      const newData = { ...data, devices: [...data.devices, d] };
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
      return {
        ...state,
        data: { ...data, devices: newDevices },
        ui: { ...state.ui, sheet: null, toast: { message: `Saved ${action.changes.name}` } },
        flashId: action.id,
      };
    }

    case 'REMOVE_DEVICE': {
      const d = dev(action.id);
      if (!d) return state;
      const snapshot = JSON.stringify(data);
      return {
        ...state,
        data: { ...data, devices: data.devices.filter((x) => x.id !== d.id) },
        ui: { ...state.ui, sheet: null, toast: { message: `Removed ${d.name}`, undo: snapshot } },
      };
    }

    case 'MASTER_ACTION': {
      const snapshot = JSON.stringify(data);
      const gid = action.groupId;
      let newDevices;
      if (action.act === 'lockall') {
        newDevices = data.devices.map((x) => x.group === gid && x.type === 'lock' ? { ...x, locked: true } : x);
      } else {
        const on = action.act === 'allon';
        newDevices = data.devices.map((x) => x.group === gid && MASTER_TYPES.includes(x.type) ? { ...x, on } : x);
      }
      const gname = grp(gid)?.name || 'Other';
      const msg = action.act === 'lockall'
        ? `${gname}: all doors locked`
        : `${gname}: everything turned ${action.act === 'allon' ? 'on' : 'off'}`;
      return { ...state, data: { ...data, devices: newDevices }, ui: { ...state.ui, toast: { message: msg, undo: snapshot } } };
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

      return { ...state, data: { ...data, devices: newDevices }, ui: { ...state.ui, toast: { message: msg, undo: snapshot } } };
    }

    case 'ADD_GROUP': {
      const g = { id: uid('g'), name: action.name, icon: action.icon };
      return {
        ...state,
        data: { ...data, groups: [...data.groups, g] },
        ui: { ...state.ui, filter: g.id, sheet: null, toast: { message: `Created ${g.name}. Add devices to it from here.` } },
      };
    }

    case 'SAVE_GROUP': {
      const newGroups = data.groups.map((g) => g.id === action.id ? { ...g, name: action.name, icon: action.icon } : g);
      return { ...state, data: { ...data, groups: newGroups }, ui: { ...state.ui, sheet: null, toast: { message: `Saved ${action.name}` } } };
    }

    case 'DELETE_GROUP': {
      const g = grp(action.id);
      if (!g) return state;
      const snapshot = JSON.stringify(data);
      const n = data.devices.filter((x) => x.group === g.id).length;
      const newDevices = data.devices.map((x) => x.group === g.id ? { ...x, group: null } : x);
      const newGroups = data.groups.filter((y) => y.id !== g.id);
      let filter = state.ui.filter === g.id ? 'all' : state.ui.filter;
      const msg = n
        ? `Deleted ${g.name}. Its ${n} ${n === 1 ? 'device moved' : 'devices moved'} to Other.`
        : `Deleted ${g.name}`;
      return { ...state, data: { ...data, devices: newDevices, groups: newGroups }, ui: { ...state.ui, filter, sheet: null, toast: { message: msg, undo: snapshot } } };
    }

    case 'UNDO': {
      if (!state.ui.toast?.undo) return state;
      const restored = JSON.parse(state.ui.toast.undo);
      return { ...state, data: restored, ui: { ...state.ui, sheet: null, toast: { message: 'Undone' } } };
    }

    case 'RESET': {
      const fresh = seed();
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

const UI_ONLY_ACTIONS = new Set([
  'SET_FILTER', 'TOGGLE_EDITING', 'OPEN_SHEET', 'CLOSE_SHEET', 'DISMISS_TOAST', 'CLEAR_FLASH', 'SET_DATA',
]);

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    data: { groups: [], devices: [] },
    ui: initialUI,
    flashId: null,
    loading: true,
  });

  const prevDataRef = useRef(state.data);

  useEffect(() => {
    api.getState().then((data) => {
      dispatch({ type: 'SET_DATA', data });
    });
  }, []);

  useEffect(() => {
    if (state.loading) return;
    if (state.data === prevDataRef.current) return;
    prevDataRef.current = state.data;
    api.putState(state.data);
  }, [state.data, state.loading]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
