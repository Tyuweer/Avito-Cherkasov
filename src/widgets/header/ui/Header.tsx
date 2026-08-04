import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Инвентарь', href: '/inventory' },
  { name: 'Поиск цепочек', href: '/search' },
  { name: 'Мои сделки', href: '/deals' },
];

export const Header = observer(() => {
  const location = useLocation();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00AAFF] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg hidden sm:block">Цепочка обмена</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#00AAFF] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">
                    {item.href === '/inventory' && '📦'}
                    {item.href === '/search' && '🔍'}
                    {item.href === '/deals' && '🔗'}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* User menu placeholder */}
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">U</span>
          </div>
        </div>
      </div>
    </header>
  );
});
