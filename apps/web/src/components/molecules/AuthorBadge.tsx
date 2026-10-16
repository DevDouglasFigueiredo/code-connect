import { Avatar } from '../atoms/Avatar';

export function AuthorBadge({ name }: { name: string }) {
  return <span className="flex min-w-0 items-center gap-2 text-sm font-semibold"><Avatar name={name} /><span className="truncate" title={name}>{name}</span></span>;
}
