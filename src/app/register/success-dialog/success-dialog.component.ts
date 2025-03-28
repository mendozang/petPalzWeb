import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  template: `
    <div class="dialog-container">
        <h4 mat-dialog-title>¡Registro exitoso!</h4>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onClose()">Ok</button>
</div>
    </div>
  `,
  styleUrls: ['./success-dialog.component.scss']
})
export class SuccessDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}