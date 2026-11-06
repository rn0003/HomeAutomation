import { useState } from 'react';
import { useStore } from '../store';
import { TYPES, SUGGEST } from '../constants';
import Icon from './Icon';

export default function DeviceForm({ sheet }) {
  const { state, dispatch } = useStore();
  const isNew = !sheet.id;
  const [draft, setDraft] = useState({ ...sheet.draft });
  const [error, setError] = useState('');

  const rooms = [...new Set(state.data.devices.map((d) => d.room).filter(Boolean))];
  const grp = (id) => state.data.groups.find((g) => g.id === id);

  const pickType = (type) => {
    const prevLabel = draft.type ? TYPES[draft.type].label : '';
    const name = !draft.name || draft.name === prevLabel ? TYPES[type].label : draft.name;
    let group = draft.group;
    if (!draft.groupLocked) {
      const sg = SUGGEST[type];
      group = sg && grp(sg) ? sg : null;
    }
    setDraft({ ...draft, type, name, group });
  };

  const close = () => dispatch({ type: 'CLOSE_SHEET' });

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setError('Give the device a name so you can find it later.');
      return;
    }
    if (sheet.id) {
      dispatch({ type: 'SAVE_DEVICE', id: sheet.id, changes: { name, room: draft.room.trim(), group: draft.group } });
    } else {
      dispatch({ type: 'ADD_DEVICE', device: { type: draft.type, name, room: draft.room.trim(), group: draft.group } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') save();
  };

  return (
    <>
      <div className="sh-head">
        <div className="grow">
          <h2 className="sh-title" id="shTitle">{isNew ? 'Add a device' : 'Edit device'}</h2>
          <div className="sh-sub">
            {isNew
              ? 'Pick what kind of device it is, then name it.'
              : 'Rename it, change its room, or move it to another group.'}
          </div>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close">
          <Icon name="x" />
        </button>
      </div>

      {isNew && (
        <div>
          <div className="lbl">Type</div>
          <div className="types">
            {Object.entries(TYPES).map(([k, t]) => (
              <button
                key={k}
                className="type"
                aria-pressed={draft.type === k ? 'true' : 'false'}
                onClick={() => pickType(k)}
              >
                <Icon name={t.icon} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {draft.type && (
        <>
          <div>
            <label className="lbl" htmlFor="f-name">Name</label>
            <input
              className="txt"
              id="f-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoFocus={!isNew}
            />
          </div>
          <div>
            <label className="lbl" htmlFor="f-room">Room</label>
            <input
              className="txt"
              id="f-room"
              value={draft.room}
              onChange={(e) => setDraft({ ...draft, room: e.target.value })}
              onKeyDown={handleKeyDown}
              list="rooms"
              autoComplete="off"
              placeholder="e.g. Kitchen"
            />
            <datalist id="rooms">
              {rooms.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <div>
            <div className="lbl">Group</div>
            <div className="choices">
              {state.data.groups.map((g) => (
                <button
                  key={g.id}
                  className="choice"
                  aria-pressed={draft.group === g.id ? 'true' : 'false'}
                  onClick={() => setDraft({ ...draft, group: g.id, groupLocked: true })}
                >
                  <Icon name={g.icon} />
                  {g.name}
                </button>
              ))}
              <button
                className="choice"
                aria-pressed={draft.group === null ? 'true' : 'false'}
                onClick={() => setDraft({ ...draft, group: null, groupLocked: true })}
              >
                <Icon name="box" />
                Other
              </button>
            </div>
          </div>

          {error && <div className="err" role="alert">{error}</div>}

          <div className="actions">
            {!isNew && (
              <button
                className="btn danger"
                onClick={() => dispatch({ type: 'REMOVE_DEVICE', id: sheet.id })}
              >
                Remove
              </button>
            )}
            <button className="btn primary" onClick={save}>
              {isNew ? 'Add device' : 'Save'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
