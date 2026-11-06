import { useState, useEffect } from 'react';

function getTime() {
  const n = new Date();
  return {
    time: n.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, ''),
    date: n.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

export default function Clock() {
  const [clock, setClock] = useState(getTime);

  useEffect(() => {
    const id = setInterval(() => setClock(getTime()), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="clock">{clock.time}</div>
      <div className="date">{clock.date}</div>
    </div>
  );
}
