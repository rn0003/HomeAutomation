import { useStore } from '../store';
import { iconFor, SPEEDS } from '../constants';
import Icon from './Icon';

function RangeSlider({ field, value, label, fill, onChange }) {
  const pct = value + '%';
  return (
    <div>
      <div className="field-label">
        <label htmlFor={`rg-${field}`}>{label}</label>
        <output>{pct}</output>
      </div>
      <input
        className="big"
        type="range"
        id={`rg-${field}`}
        min="0"
        max="100"
        step="1"
        value={value}
        style={{ '--fill': `var(${fill})`, '--p': pct }}
        onChange={(e) => onChange(field, +e.target.value)}
      />
    </div>
  );
}

export default function ControlSheet({ device }) {
  const { state, dispatch } = useStore();
  const d = device;
  if (!d) return null;

  const grp = state.data.groups.find((g) => g.id === d.group);

  const update = (changes) => {
    dispatch({ type: 'UPDATE_DEVICE', id: d.id, changes });
  };

  const handleRange = (field, value) => {
    const changes = { [field]: value };
    if (d.type === 'dimmer' && field === 'level') changes.on = value > 0;
    update(changes);
  };

  const togglePower = () => update({ on: !d.on });

  const openEdit = () => {
    dispatch({
      type: 'OPEN_SHEET',
      sheet: { kind: 'device', id: d.id, draft: { type: d.type, name: d.name, room: d.room, group: d.group } },
    });
  };

  const close = () => dispatch({ type: 'CLOSE_SHEET' });

  const PowerBtn = ({ onLabel, offLabel }) => (
    <button className="power" onClick={togglePower} aria-pressed={d.on ? 'true' : 'false'}>
      <Icon name="power" />
      {d.on ? onLabel : offLabel}
    </button>
  );

  return (
    <>
      <div className="sh-head">
        <span className="tile-ico" style={{ background: 'var(--bg)' }}>
          <Icon name={iconFor(d)} />
        </span>
        <div className="grow">
          <h2 className="sh-title" id="shTitle">{d.name}</h2>
          <div className="sh-sub">{d.room || 'No room'} · {grp ? grp.name : 'Other'}</div>
        </div>
        <button className="icon-btn" onClick={openEdit} aria-label={`Edit ${d.name}`}>
          <Icon name="pencil" />
        </button>
        <button className="icon-btn" onClick={close} aria-label="Close">
          <Icon name="x" />
        </button>
      </div>

      {d.type === 'switch' && <PowerBtn onLabel="On · tap to turn off" offLabel="Off · tap to turn on" />}

      {d.type === 'dimmer' && (
        <>
          <PowerBtn onLabel="On" offLabel="Off" />
          <RangeSlider field="level" value={d.level} label="Brightness" fill="--warm" onChange={handleRange} />
          <div className="presets" style={{ marginTop: '-6px' }}>
            {[10, 25, 50, 75, 100].map((v) => (
              <button key={v} onClick={() => update({ level: v, on: true })} aria-label={`Set brightness to ${v}%`}>
                {v}%
              </button>
            ))}
          </div>
        </>
      )}

      {d.type === 'plug' && (
        <>
          <PowerBtn onLabel="On" offLabel="Off" />
          <div className="readout">
            <span>Power draw now</span>
            <b>{d.on ? d.watts : 0} W</b>
          </div>
        </>
      )}

      {d.type === 'fan' && (
        <>
          <PowerBtn onLabel="On" offLabel="Off" />
          <div>
            <div className="field-label">Speed</div>
            <div className="seg">
              {SPEEDS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => update({ speed: i + 1, on: true })}
                  aria-pressed={d.speed === i + 1 ? 'true' : 'false'}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {d.type === 'speaker' && (
        <>
          <button className="power" onClick={togglePower} aria-pressed={d.on ? 'true' : 'false'}>
            <Icon name={d.on ? 'pause' : 'play'} />
            {d.on ? 'Playing · tap to pause' : 'Paused · tap to play'}
          </button>
          <RangeSlider field="volume" value={d.volume} label="Volume" fill="--accent" onChange={handleRange} />
        </>
      )}

      {d.type === 'blinds' && (
        <>
          <RangeSlider field="level" value={d.level} label="Open" fill="--cool" onChange={handleRange} />
          <div className="actions">
            <button className="btn" onClick={() => update({ level: 0 })}>Close</button>
            <button className="btn" onClick={() => update({ level: 50 })}>Half</button>
            <button className="btn" onClick={() => update({ level: 100 })}>Open</button>
          </div>
        </>
      )}

      {d.type === 'lock' && (
        <button
          className={`power ${d.locked ? 'lock-on' : 'lock-off'}`}
          onClick={() => update({ locked: !d.locked })}
        >
          <Icon name={d.locked ? 'lock' : 'unlock'} />
          {d.locked ? 'Locked · tap to unlock' : 'Unlocked · tap to lock'}
        </button>
      )}

      {d.type === 'thermostat' && (
        <>
          <div className="thermo">
            <button
              className="step"
              onClick={() => {
                const target = Math.max(50, d.target - 1);
                const mode = d.mode === 'off' ? (target >= d.current ? 'heat' : 'cool') : d.mode;
                update({ target, mode });
              }}
              aria-label="Lower target"
            >
              <Icon name="minus" />
            </button>
            <div>
              <div className="cap">Set to</div>
              <div className="big-num" aria-live="polite">{d.target}°</div>
              <div className="cap">{d.current}° inside now</div>
            </div>
            <button
              className="step"
              onClick={() => {
                const target = Math.min(86, d.target + 1);
                const mode = d.mode === 'off' ? (target >= d.current ? 'heat' : 'cool') : d.mode;
                update({ target, mode });
              }}
              aria-label="Raise target"
            >
              <Icon name="plus" />
            </button>
          </div>
          <div>
            <div className="field-label">Mode</div>
            <div className="seg">
              {['heat', 'cool', 'off'].map((m) => (
                <button
                  key={m}
                  onClick={() => update({ mode: m })}
                  aria-pressed={d.mode === m ? 'true' : 'false'}
                >
                  {m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
