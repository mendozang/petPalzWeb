import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-success-dialog',
  template: `
    <div class="dialog-container">
        <h4 mat-dialog-title>¡Actualización exitosa!</h4>
        <div mat-dialog-content>
            <p>{{ data.message }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onClose()">Ok</button>
</div>
    </div>
  `,
  styleUrls: ['./update-profile-dialog.component.scss']
})
export class UpdateProfileDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}