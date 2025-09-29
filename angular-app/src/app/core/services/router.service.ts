import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RouterSignalsService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  public params = toSignal(this.activatedRoute.params, { initialValue: {} });
  public queryParams = toSignal(this.activatedRoute.queryParams, {
    initialValue: {},
  });
  public fragment = toSignal(this.activatedRoute.fragment, {
    initialValue: null,
  });

  public segments = computed(() =>
    this.currentUrl().split('/').filter(Boolean)
  );
  public activeRoute = computed(() => this.segments()[0] ?? '');
  public history = computed(() => this.historySignal());

  private historySignal = signal<string[]>([this.router.url]);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) =>
        this.historySignal.update((history) => [
          ...history,
          event.urlAfterRedirects,
        ])
      );
  }
}
