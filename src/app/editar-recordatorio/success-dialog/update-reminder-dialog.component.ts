import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-reminder-dialog',
  template: `
    <div class="dialog-container">
        <h4 mat-dialog-title>¡Recordatorio actualizado!</h4>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onClose()">Ok</button>
</div>
    </div>
  `,
  styleUrls: ['./update-reminder-dialog.component.scss']
})
export class UpdateReminderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}