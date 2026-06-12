import { useEffect, useState } from 'react';

const messages = [
  'New notification',
  'Interview drive opens tomorrow',
  'New resume template added',
  'Your profile got 12 views',
  'Mock interview slots are live',
];

const AUTO_CLOSE_MS = 60000;

export default function Notifications() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), AUTO_CLOSE_MS);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  const ticker = [...messages, ...messages];

  return (
    <div className="h-10 overflow-hidden">
      <div className="notification-track flex h-full items-center whitespace-nowrap">
        {ticker.map((message, index) => (
          <span key={`${message}-${index}`} className="mx-4 text-xs font-medium tracking-wide">
            {message}
            <span className="ml-4 opacity-60">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
