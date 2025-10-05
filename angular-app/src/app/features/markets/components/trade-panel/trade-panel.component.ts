import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ArrowDown,
  ArrowUp,
  LucideAngularModule,
  ShoppingCart,
  Wallet,
} from 'lucide-angular';
import { Quote } from '../../interfaces/market.interfaces';
import { MarketsStore } from '../../store/markets.store';

@Component({
  standalone: true,
  selector: 'app-trade-panel',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './trade-panel.component.html',
  styleUrl: './trade-panel.component.scss',
})
export class TradePanelComponent {
  public selected = input<string | null>(null);
  public quote = input<Quote | null>(null);

  protected iconUp = ArrowUp;
  protected iconDown = ArrowDown;
  protected Wallet = Wallet;
  protected ShoppingCart = ShoppingCart;

  private readonly defaults = {
    side: 'BUY' as 'BUY' | 'SELL',
    quantity: 1,
    priceType: 'MARKET' as 'MARKET' | 'LIMIT',
    limitPrice: null as number | null,
    tif: 'DAY' as 'DAY' | 'GTC',
  };

  private formBuilder = inject(NonNullableFormBuilder);
  public form = this.formBuilder.group({
    side: this.formBuilder.control<'BUY' | 'SELL'>(this.defaults.side),
    quantity: this.formBuilder.control<number>(this.defaults.quantity, [
      Validators.min(1),
    ]),
    priceType: this.formBuilder.control<'MARKET' | 'LIMIT'>(
      this.defaults.priceType
    ),
    limitPrice: this.formBuilder.control<number | null>(
      this.defaults.limitPrice
    ),
    tif: this.formBuilder.control<'DAY' | 'GTC'>(this.defaults.tif),
  });

  side = signal<'BUY' | 'SELL'>(this.defaults.side);
  quantity = signal<number>(this.defaults.quantity);
  priceType = signal<'MARKET' | 'LIMIT'>(this.defaults.priceType);
  limitPrice = signal<number | null>(this.defaults.limitPrice);
  tif = signal<'DAY' | 'GTC'>(this.defaults.tif);

  private store = inject(MarketsStore);

  protected owned = computed(() => {
    const symbol = this.selected();
    const position = this.store.getPosition(symbol);
    return position.quantity;
  });

  protected availableCash = computed(() => this.store.cash());

  protected canSell = computed(() => this.owned() > 0);
  protected maxQty = computed(() =>
    this.form.controls.side.value === 'SELL'
      ? Math.max(0, this.owned())
      : Number.MAX_SAFE_INTEGER
  );

  protected estimatedCost = computed(() => {
    const quantity = this.quantity() || 0;
    const px =
      this.priceType() === 'MARKET'
        ? this.quote()?.last ?? 0
        : this.limitPrice() ?? 0;

    return quantity * px;
  });

  protected fee = computed(() => {
    const amount = this.estimatedCost();
    return amount * this.store.getFeeRate();
  });

  protected net = computed(() => {
    const amount = this.estimatedCost();
    const fee = this.fee();
    return this.side() === 'BUY' ? amount + fee : amount - fee;
  });

  protected isBuyActive = computed(() => this.side() === 'BUY');
  protected isSellActive = computed(() => this.side() === 'SELL');
  protected isLimitPriceEnabled = computed(() => this.priceType() === 'LIMIT');

  protected isDisabled = computed(() =>
    this.isBuyActive() ? this.isBuyDisabled() : this.isSellDisabled()
  );

  private isBuyDisabled = computed(
    () => this.isBuyActive() && this.net() > this.availableCash()
  );
  private isSellDisabled = computed(
    () => this.isSellActive() && this.quantity() > this.owned()
  );

  constructor() {
    effect(() => {
      const selected = this.selected();
      if (selected) {
        this.resetInputs();
      }
    });

    this.listenToFormChanges();
  }

  protected onSideChange(value: 'BUY' | 'SELL') {
    if (!value) {
      return;
    }

    this.form.controls.side.setValue(value);
  }

  protected onLimitPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.value) {
      return;
    }

    this.form.controls.limitPrice.setValue(Number(target.value));
  }

  protected onTimeInForceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (!target.value) {
      return;
    }

    this.form.controls.tif.setValue(target.value as 'DAY' | 'GTC');
  }

  protected onPriceTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (!target.value) {
      return;
    }

    this.form.controls.priceType.setValue(target.value as 'MARKET' | 'LIMIT');
  }

  protected onQuantityChange(value: number | string) {
    const n = Math.max(1, Math.trunc(Number(value) || 1));
    const capped = Math.min(n, this.maxQty());

    if (capped !== this.form.controls.quantity.value) {
      this.form.controls.quantity.setValue(capped);
    }
  }

  protected submit() {
    const symbol = this.selected();

    if (!symbol) {
      return;
    }

    const marketPrice = this.quote()?.last ?? 0;
    const execPrice =
      this.priceType() === 'MARKET'
        ? marketPrice
        : this.limitPrice() ?? marketPrice;

    this.store.updateCurrentPrice(symbol, marketPrice);
    this.store.applyOrder({
      symbol,
      side: this.side(),
      quantity: this.quantity(),
      price: execPrice,
      timestamp: new Date().toISOString(),
    });
  }

  private resetInputs() {
    this.form.setValue({
      side: this.defaults.side,
      quantity: this.defaults.quantity,
      priceType: this.defaults.priceType,
      limitPrice: this.defaults.limitPrice,
      tif: this.defaults.tif,
    });
  }

  private listenToFormChanges() {
    this.form.valueChanges.subscribe((formValues) => {
      for (const [key, value] of Object.entries(formValues)) {
        (this[key as keyof TradePanelComponent] as WritableSignal<unknown>).set(
          value
        );
      }
    });
  }
}
