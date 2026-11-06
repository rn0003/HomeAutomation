import { useEffect } from 'react';
import { useStore } from './store';
import { TYPES } from './constants';
import Clock from './components/Clock';
import Summary from './components/Summary';
import Groups from './components/Groups';
import Scenes from './components/Scenes';
import Section from './components/Section';
import Sheet from './components/Sheet';
import Toast from './components/Toast';
import Icon from './components/Icon';

export default function App() {
  const { state, dispatch } = useStore();
  const { filter, editing } = state.ui;
  const { groups, devices } = state.data;

  useEffect(() => {
    const id = setInterval(() => {
      let changed = false;
      const newDevices = state.data.devices.map((d) => {
        if (d.type !== 'thermostat' || d.mode === 'off') return d;
        if (d.mode === 'heat' && d.current < d.target) { changed = true; return { ...d, current: d.current + 1 }; }
        if (d.mode === 'cool' && d.current > d.target) { changed = true; return { ...d, current: d.current - 1 }; }
        return d;
      });
      if (changed) {
        newDevices.forEach((d, i) => {
          if (d !== state.data.devices[i]) {
            dispatch({ type: 'UPDATE_DEVICE', id: d.id, changes: { current: d.current } });
          }
        });
      }
    }, 20000);
    return () => clearInterval(id);
  }, [state.data.devices, dispatch]);

  let sections;
  if (filter === 'all') {
    sections = [...groups.map((g) => g)];
    if (devices.some((d) => d.group === null)) sections.push(null);
  } else if (filter === 'none') {
    sections = [null];
  } else {
    const g = groups.find((g) => g.id === filter);
    sections = g ? [g] : [];
  }

  const handleAdd = () => {
    let group = filter !== 'all' && filter !== 'none' ? filter : undefined;
    if (filter === 'none') group = null;
    dispatch({
      type: 'OPEN_SHEET',
      sheet: {
        kind: 'device',
        id: null,
        draft: { type: null, name: '', room: '', group: group, groupLocked: group !== undefined },
      },
    });
  };

  return (
    <>
      <div className={`app${editing ? ' editing' : ''}`}>
        <aside className="rail">
          <div className="rail-top">
            <Clock />
            <button
              className="edit-btn"
              onClick={() => dispatch({ type: 'TOGGLE_EDITING' })}
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
          <Summary />
          <Groups />
        </aside>
        <main>
          <Scenes />
          <div className="edit-note">
            Editing. Tap a device to rename it or move it to another group. Tap the red × to remove it.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {sections.map((g) => (
              <Section key={g ? g.id : 'other'} group={g} />
            ))}
          </div>
          <div className="foot">
            Example devices for this prototype. Changes are kept in this browser only.{' '}
            <button onClick={() => dispatch({ type: 'RESET' })}>Reset example home</button>
          </div>
        </main>
      </div>
      <button className="fab" onClick={handleAdd}>
        <Icon name="plus" />
        Add device
      </button>
      <Sheet />
      <Toast />
    </>
  );
}
