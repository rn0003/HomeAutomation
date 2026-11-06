import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import ControlSheet from './ControlSheet';
import DeviceForm from './DeviceForm';
import GroupForm from './GroupForm';

export default function Sheet() {
  const { state, dispatch } = useStore();
  const sheet = state.ui.sheet;

  const close = useCallback(() => dispatch({ type: 'CLOSE_SHEET' }), [dispatch]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && sheet) close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sheet, close]);

  if (!sheet) return null;

  const device = sheet.kind === 'control' ? state.data.devices.find((d) => d.id === sheet.id) : null;

  let body = null;
  if (sheet.kind === 'control') {
    body = <ControlSheet device={device} />;
  } else if (sheet.kind === 'device') {
    body = <DeviceForm sheet={sheet} />;
  } else if (sheet.kind === 'group') {
    body = <GroupForm sheet={sheet} />;
  }

  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="shTitle">
        <div className="grab" />
        {body}
      </div>
    </div>
  );
}
