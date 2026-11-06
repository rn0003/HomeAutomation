import { useStore } from '../store';
import Icon from './Icon';

export default function Groups() {
  const { state, dispatch } = useStore();
  const { groups, devices } = state.data;
  const { filter } = state.ui;

  const cnt = (id) => devices.filter((d) => d.group === id).length;
  const hasOther = devices.some((d) => d.group === null);

  return (
    <nav className="groups" aria-label="Device groups">
      <button
        className="g"
        aria-current={filter === 'all' ? 'true' : undefined}
        onClick={() => dispatch({ type: 'SET_FILTER', filter: 'all' })}
      >
        <Icon name="grid" />
        All devices
        <span className="n">{devices.length}</span>
      </button>
      {groups.map((g) => (
        <button
          key={g.id}
          className="g"
          aria-current={filter === g.id ? 'true' : undefined}
          onClick={() => dispatch({ type: 'SET_FILTER', filter: g.id })}
        >
          <Icon name={g.icon} />
          {g.name}
          <span className="n">{cnt(g.id)}</span>
        </button>
      ))}
      {hasOther && (
        <button
          className="g"
          aria-current={filter === 'none' ? 'true' : undefined}
          onClick={() => dispatch({ type: 'SET_FILTER', filter: 'none' })}
        >
          <Icon name="box" />
          Other
          <span className="n">{cnt(null)}</span>
        </button>
      )}
      <button
        className="g new"
        onClick={() =>
          dispatch({ type: 'OPEN_SHEET', sheet: { kind: 'group', id: null, draft: { name: '', icon: 'home' } } })
        }
      >
        <Icon name="plus" />
        New group
      </button>
    </nav>
  );
}
