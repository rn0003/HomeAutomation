import { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { tone, isActive, stateText, iconFor } from '../constants';
import Icon from './Icon';

export default function DeviceTile({ device }) {
  const { state, dispatch } = useStore();
  const { editing } = state.ui;
  const wrapRef = useRef(null);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const d = device;
  const t = tone(d);
  const canToggle = d.type !== 'thermostat';

  useEffect(() => {
    if (state.flashId === d.id && wrapRef.current) {
      wrapRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      wrapRef.current.classList.add('flash');
      const timer = setTimeout(() => {
        wrapRef.current?.classList.remove('flash');
        dispatch({ type: 'CLEAR_FLASH' });
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [state.flashId, d.id, dispatch]);

  const handlePointerDown = useCallback(
    (e) => {
      if (editing) return;
      longPressed.current = false;
      clearTimeout(pressTimer.current);
      pressTimer.current = setTimeout(() => {
        longPressed.current = true;
        dispatch({ type: 'OPEN_SHEET', sheet: { kind: 'control', id: d.id } });
      }, 480);
    },
    [editing, d.id, dispatch]
  );

  const cancelPress = useCallback(() => {
    clearTimeout(pressTimer.current);
  }, []);

  const handleClick = useCallback(() => {
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (editing) {
      dispatch({
        type: 'OPEN_SHEET',
        sheet: { kind: 'device', id: d.id, draft: { type: d.type, name: d.name, room: d.room, group: d.group } },
      });
    } else {
      dispatch({ type: 'TOGGLE', id: d.id });
    }
  }, [editing, d, dispatch]);

  const handleContextMenu = useCallback((e) => e.preventDefault(), []);

  return (
    <div ref={wrapRef} className={`tile-wrap tone-${t}-wrap`} data-id={d.id}>
      <button
        className={`tile tone-${t}`}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={handleContextMenu}
        {...(canToggle ? { 'aria-pressed': isActive(d) ? 'true' : 'false' } : {})}
        aria-label={`${d.name}, ${d.room || 'No room'}, ${stateText(d)}`}
      >
        <span className="tile-top">
          <span className="tile-ico"><Icon name={iconFor(d)} /></span>
          {d.type === 'thermostat' && <span className="temp">{d.current}°</span>}
        </span>
        <span className="tile-name">{d.name}</span>
        <span className="tile-room">{d.room || 'No room'}</span>
        <span className="tile-state">{stateText(d)}</span>
      </button>
      <button
        className="tile-more"
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'OPEN_SHEET', sheet: { kind: 'control', id: d.id } });
        }}
        aria-label={`Adjust ${d.name}`}
      >
        <Icon name="dots" />
      </button>
      <button
        className="tile-remove"
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'REMOVE_DEVICE', id: d.id });
        }}
        aria-label={`Remove ${d.name}`}
      >
        <Icon name="x" />
      </button>
    </div>
  );
}
