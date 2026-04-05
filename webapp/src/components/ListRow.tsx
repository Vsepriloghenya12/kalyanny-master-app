import type { ReactNode } from 'react';

type ListRowProps = {
  image: string;
  title: string;
  subtitle: string;
  meta?: string;
  action?: ReactNode;
  onClick?: () => void;
};

export function ListRow({ image, title, subtitle, meta, action, onClick }: ListRowProps) {
  const content = (
    <>
      <img src={image} alt={title} className="list-row__image" />
      <div className="list-row__text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        {meta ? <span>{meta}</span> : null}
      </div>
      {action ? <div className="list-row__action">{action}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="list-row list-row--button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <article className="list-row">{content}</article>;
}
