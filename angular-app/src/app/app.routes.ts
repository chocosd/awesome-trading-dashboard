import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'markets' },
      {
        path: 'markets',
        loadComponent: () =>
          import('./features/markets/pages/markets.page').then(
            (m) => m.MarketsPage
          ),
      },
      {
        path: 'portfolio',
        loadComponent: () =>
          import('./features/portfolio/pages/portfolio.page').then(
            (m) => m.PortfolioPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings.page').then(
            (m) => m.SettingsPage
          ),
      },
    ],
  },
];
