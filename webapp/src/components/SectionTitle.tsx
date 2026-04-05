import type { ReactNode } from 'react';

type SectionTitleProps = {
  title: string;
  action?: ReactNode;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="section-title">
      <div className="section-title__divider" aria-hidden="true">
        <span className="section-title__line" />
        <h2>{title}</h2>
        <span className="section-title__line" />
      </div>
      {action ? <div className="section-title__action">{action}</div> : null}
    </div>
  );
}
