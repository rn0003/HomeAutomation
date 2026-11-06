import { useState } from 'react';
import { useStore } from '../store';
import { GROUP_ICONS } from '../constants';
import Icon from './Icon';

export default function GroupForm({ sheet }) {
  const { dispatch } = useStore();
  const isNew = !sheet.id;
  const [draft, setDraft] = useState({ ...sheet.draft });
  const [error, setError] = useState('');

  const close = () => dispatch({ type: 'CLOSE_SHEET' });

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setError("Give the group a name, like Garden or Kids' rooms.");
      return;
    }
    if (sheet.id) {
      dispatch({ type: 'SAVE_GROUP', id: sheet.id, name, icon: draft.icon });
    } else {
      dispatch({ type: 'ADD_GROUP', name, icon: draft.icon });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') save();
  };

  return (
    <>
      <div className="sh-head">
        <div className="grow">
          <h2 className="sh-title" id="shTitle">{isNew ? 'New group' : 'Edit group'}</h2>
          <div className="sh-sub">
            Groups collect devices that do the same job, so you can control them together.
          </div>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close">
          <Icon name="x" />
        </button>
      </div>

      <div>
        <label className="lbl" htmlFor="g-name">Name</label>
        <input
          className="txt"
          id="g-name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Garden"
          autoComplete="off"
          autoFocus
        />
      </div>

      <div>
        <div className="lbl">Icon</div>
        <div className="choices">
          {GROUP_ICONS.map((icon) => (
            <button
              key={icon}
              className="choice sq"
              aria-pressed={draft.icon === icon ? 'true' : 'false'}
              onClick={() => setDraft({ ...draft, icon })}
              aria-label={`${icon} icon`}
            >
              <Icon name={icon} />
            </button>
          ))}
        </div>
      </div>

      {error && <div className="err" role="alert">{error}</div>}

      <div className="actions">
        {!isNew && (
          <button className="btn danger" onClick={() => dispatch({ type: 'DELETE_GROUP', id: sheet.id })}>
            Delete group
          </button>
        )}
        <button className="btn primary" onClick={save}>
          {isNew ? 'Create group' : 'Save'}
        </button>
      </div>
    </>
  );
}
