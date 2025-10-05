import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ColumnType, TableConfig } from '../table.types';

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T extends Record<string, unknown>> {
  public data = input<T[]>([]);
  public config = input.required<TableConfig<T>>();

  protected ColumnType = ColumnType;

  protected computedRows = computed(() =>
    this.data().map((row) => {
      const out: Record<string, unknown> = { ...row };
      for (const col of this.config().rows) {
        if (col.colorBySign) {
          const val = Number(row[col.key] as number | string);
          out[`${col.key}__positive`] = val > 0;
          out[`${col.key}__negative`] = val < 0;
        }
      }
      return out as T & Record<string, boolean>;
    })
  );
}
