import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-checkbox-cell-renderer',
  template: `<input style="cursor:pointer;" type="checkbox" [checked]="params.value" (change)="onCheckboxChange($event)">`,
})
export class CheckboxComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  onCheckboxChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.params.node?.setDataValue('isIncluded', isChecked);
    this.params.context?.parentComponent?.onCheckboxChange(isChecked, this.params.data)
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params; 
    return true;
  }
}
