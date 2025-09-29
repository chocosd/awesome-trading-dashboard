import {
  AlignHorizontalDistributeCenter,
  BarChart,
  PieChart,
  Settings,
  User,
} from 'lucide-angular';
import { NavItem } from '../types/nav-item.interface';

export const PRIMARY_NAV: NavItem[] = [
  { path: '/markets', icon: BarChart, label: 'Markets' },
  { path: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const SECONDARY_NAV: Record<string, NavItem[]> = {
  markets: [
    {
      path: '/markets/watchlist',
      icon: AlignHorizontalDistributeCenter,
      label: 'Watchlist',
    },
    { path: '/markets/chart', icon: PieChart, label: 'Chart' },
    { path: '/markets/trades', icon: Settings, label: 'Trades' },
  ],
  portfolio: [
    { path: '/portfolio/positions', icon: PieChart, label: 'Positions' },
    { path: '/portfolio/orders', icon: Settings, label: 'Orders' },
  ],
  settings: [
    { path: '/settings/account', icon: User, label: 'Account' },
    { path: '/settings/security', icon: Settings, label: 'Security' },
  ],
};
