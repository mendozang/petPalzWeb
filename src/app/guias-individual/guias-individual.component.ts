import { Component, signal, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guias-individual',
  imports: [
    SidebarComponent,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './guias-individual.component.html',
  styleUrls: ['./guias-individual.component.scss']
})
export class GuiasIndividualComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  article: any = {};
  category: string = '';
  id: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed: boolean): void {
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }

  screenWidth = signal<number>(0);

  @HostListener('window:resize')
  onResize() {
    this.setSidebarState();
  }

  ngOnInit(): void {
    this.setSidebarState();

    this.route.paramMap.subscribe(params => {
      this.category = params.get('category')!;
      this.id = params.get('id')!;
      this.fetchArticle();
    });
  }

  setSidebarState(): void {
    if (typeof window !== 'undefined') {
      this.screenWidth.set(window.innerWidth);
      if (this.screenWidth() < 768) {
        this.isLeftSidebarCollapsed.set(true);
      } else {
        this.isLeftSidebarCollapsed.set(false);
      }
    }
  }

  fetchArticle(): void {
    this.http.get(`https://petpalzapi.onrender.com/api/PrimerosAuxilios/${this.id}`)
      .subscribe((data: any) => {
        this.article = data;
      });
  }
}