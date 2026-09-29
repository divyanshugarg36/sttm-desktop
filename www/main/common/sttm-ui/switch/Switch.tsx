import React, { useState, useEffect } from 'react';

type SwitchProps = {
  title?: string;
  controlId?: string;
  className?: string;
  onToggle?: (isSwitched: boolean) => void;
  value?: boolean;
  disabled?: boolean;
};

const Switch = ({
  title,
  controlId,
  className,
  onToggle,
  value = false,
  disabled = false,
}: SwitchProps) => {
  const [isSwitched, setSwitchedState] = useState(value);

  useEffect(() => {
    setSwitchedState(value);
  }, [value]);

  return (
    <div className={className}>
      {title && <span>{title}</span>}
      <div className="switch">
        <input
          id={controlId}
          type="checkbox"
          checked={isSwitched}
          onChange={() => {
            const newState = !isSwitched;
            setSwitchedState(newState);
            if (onToggle) {
              onToggle(newState);
            }
          }}
          disabled={disabled}
        />
        <label htmlFor={controlId} />
      </div>
    </div>
  );
};

export default Switch;
