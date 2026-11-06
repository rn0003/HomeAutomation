import { useStore } from '../store';
import { masterFor, SUGGEST } from '../constants';
import Icon from './Icon';
import DeviceTile from './DeviceTile';

export default function Section({ group }) {
  const { state, dispatch } = useStore();
  const { devices } = state.data;
  const gid = group ? group.id : null;
  const devs = devices.filter((d) => d.group === gid);
  const m = masterFor(devs);
  const name = group ? group.name : 'Other';

  const handleMaster = () => {
    dispatch({ type: 'MASTER_ACTION', groupId: gid, act: m.act });
  };

  const handleAdd = () => {
    dispatch({
      type: 'OPEN_SHEET',
      sheet: {
        kind: 'device',
        id: null,
        draft: { type: null, name: '', room: '', group: gid, groupLocked: true },
      },
    });
  };

  return (
    <section>
      <div className="sec-head">
        <h2>{name}</h2>
        <span className="count">
          {devs.length} {devs.length === 1 ? 'device' : 'devices'}
        </span>
        <span className="spacer" />
        {m && (
          <button className="pill-btn master" onClick={handleMaster}>
            {m.label}
          </button>
        )}
        {group && (
          <span className="sec-edit">
            <button
              className="pill-btn"
              onClick={() =>
                dispatch({
                  type: 'OPEN_SHEET',
                  sheet: { kind: 'group', id: group.id, draft: { name: group.name, icon: group.icon } },
                })
              }
            >
              Rename
            </button>
          </span>
        )}
      </div>
      <div className="grid">
        {devs.map((d) => (
          <DeviceTile key={d.id} device={d} />
        ))}
        <button className="add-tile" onClick={handleAdd}>
          <Icon name="plus" />
          Add to {name}
        </button>
      </div>
      {devs.length === 0 && (
        <p className="empty">No devices in {name} yet. Tap Add device to put one here.</p>
      )}
    </section>
  );
}
