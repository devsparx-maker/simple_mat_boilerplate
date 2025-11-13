import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Mock data types
type ChildItem = { id: number; name: string; amount: number; status: string; };
type RowItem = {
  id: number; customer: string; orderNo: string; city: string; total: number;
  expanded?: boolean; children?: ChildItem[];
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <div class="container">
      <!-- The grid area -->
      <div class="grid-wrap">
        <!-- Small sort toolbar -->
        <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
          <span style="font-size:13px; color:rgba(0,0,0,.6);">מיין לפי:</span>
          <button (click)="setSort('customer','asc')">לקוח ↑</button>
          <button (click)="setSort('customer','desc')">לקוח ↓</button>
          <button (click)="setSort('total','asc')">סכום ↑</button>
          <button (click)="setSort('total','desc')">סכום ↓</button>
          <button (click)="clearSort()">נקה מיון</button>
        </div>

        <ag-grid-angular
          class="ag-theme-quartz"
          [rowData]="flatRows()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [getRowHeight]="getRowHeight"
          [domLayout]="'normal'"
          [suppressRowClickSelection]="true"
          (gridReady)="onGridReady($event)">
        </ag-grid-angular>
      </div>
    </div>
  `
})
export class HomeComponent {
  private gridApi: any;

  // Default column definition enables sorting for most columns
  defaultColDef: ColDef = {
    sortable: true,
    resizable: true
  };

  // Mock rows with nested children
  rows = signal<RowItem[]>([
    {
      id: 1, customer: 'אורי כהן', orderNo: 'A-1001', city: 'תל אביב', total: 1260,
      children: [
        { id: 11, name: 'מוצר X', amount: 2, status: 'נשלח' },
        { id: 12, name: 'מוצר Y', amount: 1, status: 'בטיפול' }
      ]
    },
    {
      id: 2, customer: 'מיכל לוי', orderNo: 'A-1002', city: 'חיפה', total: 890,
      children: [
        { id: 21, name: 'מוצר Z', amount: 5, status: 'הושלם' }
      ]
    },
    {
      id: 3, customer: 'דוד ישראלי', orderNo: 'A-1003', city: 'ירושלים', total: 430
    }
  ]);

  // Flatten rows so that when expanded we inject a synthetic "detail" row right after
  flatRows = signal<any[]>([]);
  constructor() {
    this.recompute();
    effect(() => { this.flatRows(); }); // keep signal hot for template
  }
  private recompute() {
    const out: any[] = [];
    for (const r of this.rows()) {
      out.push({ type: 'main', ...r });
      if (r.expanded) {
        out.push({ type: 'detail', parentId: r.id, children: r.children ?? [] });
      }
    }
    this.flatRows.set(out);
  }

  toggleRow(id: number) {
    const next = this.rows().map(r => r.id === id ? ({ ...r, expanded: !r.expanded }) : r);
    this.rows.set(next);
    this.recompute();
    this.gridApi?.onFilterChanged(); // nudge re-render
  }

  // GRID
  columnDefs: ColDef[] = [
    {
      headerName: '', width: 80, pinned: 'right', sortable: false,
      cellRenderer: (p: ICellRendererParams) => {
        if (p.data?.type !== 'main') return '';
        const expanded = !!p.data.expanded;
        const arrow = expanded ? '⌄' : '›'; // simple chevron
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
  }

  // Programmatic sorting helpers used by the toolbar buttons
  setSort(field: string, dir: 'asc' | 'desc') {
    if (!this.gridApi) return;
    // If the field exists on the underlying RowItem, sort the source data
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
      // clear any grid-internal sort model because we sorted the source
      try { this.gridApi.setSortModel([]); } catch (e) { /* ignore */ }
      return;
    }

    // Otherwise delegate to AG Grid's sort model
    try { this.gridApi.setSortModel([{ colId: field, sort: dir }]); } catch (err) { /* ignore */ }
  }

  clearSort() {
    if (!this.gridApi) return;
    this.gridApi.setSortModel([]);
  }
}