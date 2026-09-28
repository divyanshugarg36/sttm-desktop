import React from 'react';
/** What a pane passes its slots (ShabadPane: the pane it shows). */
export type PaneData = { multiPaneId?: number };

/** The props each slot component gets. */
export type PaneSlotProps = { className: string; data: PaneData };

type PaneProps = {
  content?: React.ComponentType<PaneSlotProps> | null;
  header?: React.ComponentType<PaneSlotProps> | null;
  footer?: React.ComponentType<PaneSlotProps> | null;
  className?: string;
  data?: PaneData;
  plain?: boolean;
};

const noData: PaneData = {};

// The header, content and footer components each render their own root, which
// takes the slot's class (pane__header / pane__content / pane__footer).
// `plain` drops the box styling, for a pane that sits inside another pane's box.
const Pane = ({
  content: Content = null,
  header: Header = null,
  footer: Footer = null,
  className = '',
  data = noData,
  plain = false,
}: PaneProps) => (
  <div className={['pane', !plain && 'pane--box', className].filter(Boolean).join(' ')}>
    {Header ? <Header className="pane__header" data={data} /> : ''}
    {Content ? <Content className="pane__content" data={data} /> : ''}
    {Footer ? <Footer className="pane__footer" data={data} /> : ''}
  </div>
);

export default Pane;
