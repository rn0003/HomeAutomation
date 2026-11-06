import { useStore } from '../store';
import { SCENES } from '../constants';
import Icon from './Icon';

export default function Scenes() {
  const { dispatch } = useStore();

  return (
    <div className="scenes" aria-label="Scenes">
      {SCENES.map((s) => (
        <button key={s.id} className="scene" onClick={() => dispatch({ type: 'SCENE', id: s.id })}>
          <Icon name={s.icon} />
          {s.name}
        </button>
      ))}
    </div>
  );
}
