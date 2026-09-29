import React from 'react';

export type BaniControllerItemProps = {
  title: string;
  description: React.ReactNode;
  control: React.ReactNode;
};

// A titled group like Settings', with what it does above its controls.
const BaniControllerItem = ({ title, description, control }: BaniControllerItemProps) => (
  <section className="settings-group">
    <h4 className="settings-group__title">{title}</h4>
    <div className="setting-row sync-row">
      <div className="setting-row__label">
        <span className="setting-row__note">{description}</span>
      </div>
      <div className="setting-row__control">{control}</div>
    </div>
  </section>
);

export default BaniControllerItem;
