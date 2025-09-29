import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  Bell,
  LucideAngularModule,
  Menu,
  Settings,
  User,
} from 'lucide-angular';
import { PRIMARY_NAV, SECONDARY_NAV } from '../consts/nav.const';
import { RouterSignalsService } from '../services/router.service';
import { NavItem } from '../types/nav-item.interface';

@Component({
  standalone: true,
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  protected readonly routerSignalsService = inject(RouterSignalsService);
  public nav = PRIMARY_NAV;

  public activeRoute = computed(() => {
    const url = this.routerSignalsService.currentUrl();

    console.log(url);

    const activePath = url.split('/').reduce((prev, segment) => {
      const item = this.nav
        .find((item) => item.path === `/${segment}`)
        ?.path.replace('/', '');

      console.log('the found item', item);

      return item ?? prev;
    }, '');

    console.log(activePath);

    return activePath;
  });

  public secondaryNav: Record<string, NavItem[]> = SECONDARY_NAV;

  protected readonly Bell = Bell;
  protected readonly Menu = Menu;
  protected readonly Settings = Settings;
  protected readonly User = User;
}
