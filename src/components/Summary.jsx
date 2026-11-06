import { useStore } from '../store';
import { TYPES } from '../constants';
import Icon from './Icon';

export default function Summary() {
  const { state, dispatch } = useStore();
  const { devices } = state.data;

  const lights = devices.filter((d) => TYPES[d.type]?.light && d.on).length;
  const thermo = devices.find((d) => d.type === 'thermostat');
  const locks = devices.filter((d) => d.type === 'lock');
  const unlocked = locks.filter((d) => !d.locked);

  return (
    <div className="summary">
      <span className="chip">
        <Icon name="bulb" />
        {lights === 0 ? 'All lights off' : `${lights} ${lights === 1 ? 'light' : 'lights'} on`}
      </span>
      {thermo && (
        <span className="chip">
          <Icon name="thermo" />
          {thermo.current}° inside
        </span>
      )}
      {unlocked.length > 0
        ? unlocked.map((d) => (
            <button
              key={d.id}
              className="chip alert"
              onClick={() => dispatch({ type: 'OPEN_SHEET', sheet: { kind: 'control', id: d.id } })}
            >
              <Icon name="unlock" />
              {d.name} unlocked
            </button>
          ))
        : locks.length > 0 && (
            <span className="chip ok">
              <Icon name="lock" />
              Doors locked
            </span>
          )}
    </div>
  );
}
