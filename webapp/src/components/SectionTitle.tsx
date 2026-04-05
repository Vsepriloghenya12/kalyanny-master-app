import type { ReactNode } from 'react';

type SectionTitleProps = {
  title: string;
  action?: ReactNode;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
