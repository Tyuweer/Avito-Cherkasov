import { observer } from 'mobx-react-lite';
import type { User } from '../../../shared/types';
import { formatRating } from '../../../shared/lib/utils';

interface UserBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export const UserBadge = observer(({ user, size = 'md' }: UserBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold bg-[#00AAFF]`}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="font-medium">{user.name}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            {formatRating(user.rating)}
          </span>
          {user.declinedCount > 0 && (
            <span className="text-red-500">({user.declinedCount} отказов)</span>
          )}
        </div>
      </div>
    </div>
  );
});
