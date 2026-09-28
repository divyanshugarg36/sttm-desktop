import React from 'react';

export type BaniControllerItemProps = {
  title: string;
  description: React.ReactNode;
  control: React.ReactNode;
};

const BaniControllerItem = ({ title, description, control }: BaniControllerItemProps) => (
  <div className="sync-item">
    <div className="sync-item-left">
      <div className="sync-item-head"> {title} </div>
      <div className="sync-item-description">{description}</div>
    </div>
    <div className="sync-item-right"> {control} </div>
  </div>
);

export default BaniControllerItem;
