import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export default function Toast() {
  const { state, dispatch } = useStore();
  const toast = state.ui.toast;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => dispatch({ type: 'DISMISS_TOAST' }),
      toast.undo ? 6000 : 2800
    );
    return () => clearTimeout(timerRef.current);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <span>{toast.message}</span>
      {toast.undo && (
        <button onClick={() => dispatch({ type: 'UNDO' })}>Undo</button>
      )}
    </div>
  );
}
