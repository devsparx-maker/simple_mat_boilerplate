import { Component, effect, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { ActivatedRoute } from '@angular/router';

type ChildItem = { id: number; name: string; amount: number; status: string; };
type OrderItem = { id: number; customer: string; orderNo: string; city: string; total: number; expanded?: boolean; children?: ChildItem[] };

@Component({
  selector: 'app-orders-shell',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" style="height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; background: #f5f5f5;">
      <div style="display:flex; gap:8px; align-items:center; background: white; padding: 12px 16px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <span style="font-size:13px; color:rgba(0,0,0,.6); font-weight: 600;">מיין לפי:</span>
        <button (click)="setSort('customer','asc')" style="padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px;">לקוח ↑</button>
        <button (click)="setSort('customer','desc')" style="padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px;">לקוח ↓</button>
        <button (click)="setSort('total','asc')" style="padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px;">סכום ↑</button>
        <button (click)="setSort('total','desc')" style="padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px;">סכום ↓</button>
        <button (click)="clearSort()" style="padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; font-size: 12px;">נקה מיון</button>
      </div>

      <div style="flex: 1 1 auto; min-height: 0; display: flex; position: relative; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <ag-grid-angular
          class="ag-theme-quartz"
          style="width: 100%; height: 100%;"
          [rowData]="flatRows()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [getRowHeight]="getRowHeight"
          [domLayout]="'normal'"
          [rowHeight]="40"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>
    </div>
  `
})
export class OrdersShellComponent {
  private gridApi: any;
  private route = inject(ActivatedRoute);

  defaultColDef: ColDef = { sortable: true, resizable: true };

  rows = signal<OrderItem[]>([]);
  flatRows = signal<any[]>([]);

  constructor() {
    // Read resolver data from route and set rows
    const resolvedOrders = this.route.snapshot.data['orders'];
    console.log('🟢 OrdersShellComponent constructor: route.snapshot.data =', this.route.snapshot.data);
    console.log('🟢 OrdersShellComponent constructor: resolvedOrders =', resolvedOrders);
    if (resolvedOrders) {
      console.log('🟢 OrdersShellComponent: setting rows to', resolvedOrders);
      this.rows.set(resolvedOrders);
    } else {
      console.warn('🟢 OrdersShellComponent: WARNING - resolvedOrders is empty or undefined!');
    }
    this.recompute();
    effect(() => { 
      console.log('🟢 OrdersShellComponent effect: flatRows updated =', this.flatRows());
      this.flatRows(); 
    });
  }

  private recompute() {
    const out: any[] = [];
    for (const r of this.rows()) {
      out.push({ type: 'main', ...r });
      if (r.expanded) out.push({ type: 'detail', parentId: r.id, children: r.children ?? [] });
    }
    console.log('🟢 OrdersShellComponent.recompute(): rows count =', this.rows().length, 'flatRows count =', out.length);
    this.flatRows.set(out);
    // After update, wait a tick and check grid state
    setTimeout(() => {
      console.log('🟢 After flatRows update: flatRows() =', this.flatRows());
      if (this.gridApi) {
        console.log('🟢 Grid is ready, attempting to refresh...');
        try {
          this.gridApi.applyTransaction({ add: [] }); // trigger refresh
        } catch (e) {
          console.log('applyTransaction failed:', e);
        }
      }
    }, 50);
  }

  toggleRow(id: number) {
    const next = this.rows().map(r => r.id === id ? ({ ...r, expanded: !r.expanded }) : r);
    this.rows.set(next);
    this.recompute();
    this.gridApi?.onFilterChanged();
  }

  columnDefs: ColDef[] = [
    {
      headerName: '', width: 80, pinned: 'right', sortable: false,
      cellRenderer: (p: ICellRendererParams) => {
        if (p.data?.type !== 'main') return '';
        const expanded = !!p.data.expanded;
        const arrow = expanded ? '⌄' : '›';
        const btn = document.createElement('button');
        btn.textContent = arrow;
        btn.style.padding = '4px 10px';
        btn.onclick = () => this.toggleRow(p.data.id);
        return btn;
      }
    },
    { headerName: 'לקוח', field: 'customer', flex: 1, valueGetter: p => p.data?.customer ?? '' },
    { headerName: 'מס׳ הזמנה', field: 'orderNo', flex: 1, valueGetter: p => p.data?.orderNo ?? '' },
    { headerName: 'עיר', field: 'city', flex: 1, valueGetter: p => p.data?.city ?? '' },
    { headerName: 'סכום', field: 'total', width: 120, valueGetter: p => p.data?.total ?? '' },
    {
      headerName: 'פרטים', colId: 'details', flex: 2, sortable: false, filter: false,
      cellRenderer: (p: ICellRendererParams) => {
        if (p.data?.type !== 'detail') return '';
        const host = document.createElement('div');
        host.style.padding = '12px';
        host.style.borderTop = '1px solid rgba(0,0,0,.06)';
        host.innerHTML = `
          <div style="font-weight:600;margin-bottom:8px;">Details</div>
          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            ${
              (p.data.children as ChildItem[]).map(c => `
                <div style="border:1px solid rgba(0,0,0,.12); border-radius:10px; padding:8px 12px; min-width:220px;">
                  <div><b>שם:</b> ${c.name}</div>
                  <div><b>כמות:</b> ${c.amount}</div>
                  <div><b>סטטוס:</b> ${c.status}</div>
                </div>
              `).join('') || '<i>אין נתוני משנה</i>'
            }
          </div>
        `;
        return host;
      }
    }
  ];

  getRowHeight = (p: any) => p.data?.type === 'detail' ? 120 : 48;

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
    console.log('🟢 OrdersShellComponent.onGridReady: gridApi initialized, rowData =', this.flatRows());
    // Force grid to redraw in case rows weren't visible initially
    setTimeout(() => {
      try {
        this.gridApi.sizeColumnsToFit();
      } catch (err) {
        console.log('sizeColumnsToFit failed:', err);
      }
    }, 100);
  }

  setSort(field: string, dir: 'asc' | 'desc') {
    if (!this.gridApi) return;
    const mainFields = ['customer', 'orderNo', 'city', 'total'];
    if (mainFields.includes(field)) {
      const sorted = [...this.rows()].sort((a, b) => {
        const va = (a as any)[field];
        const vb = (b as any)[field];
        if (va == null && vb == null) return 0;
        if (va == null) return dir === 'asc' ? -1 : 1;
        if (vb == null) return dir === 'asc' ? 1 : -1;
        if (typeof va === 'number' && typeof vb === 'number') return dir === 'asc' ? va - vb : vb - va;
        const sa = String(va).localeCompare(String(vb));
        return dir === 'asc' ? sa : -sa;
      });
      this.rows.set(sorted);
      this.recompute();
      try { this.gridApi.setSortModel([]); } catch (e) { /* ignore */ }
      return;
    }
    try { this.gridApi.setSortModel([{ colId: field, sort: dir }]); } catch (err) { /* ignore */ }
  }

  clearSort() {
    if (!this.gridApi) return;
    this.gridApi.setSortModel([]);
  }
}
