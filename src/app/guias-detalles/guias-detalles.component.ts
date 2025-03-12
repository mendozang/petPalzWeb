import { Component, signal, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guias-detalles',
  imports: [
    SidebarComponent,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './guias-detalles.component.html',
  styleUrls: ['./guias-detalles.component.scss']
})
export class GuiasDetallesComponent implements OnInit {
  isLeftSidebarCollapsed = signal<boolean>(false);
  articles: any[] = [];
  category: string = '';

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
      this.fetchArticles();
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

  fetchArticles(): void {
    this.http.get(`https://petpalzapi.onrender.com/api/PrimerosAuxilios/categoria/${encodeURIComponent(this.category)}`)
      .subscribe((data: any) => {
        this.articles = data.$values || [];
      });
  }
}