import { Component } from '@angular/core';
import { LoadingScreenComponent } from '../../components/loading-screen/loading-screen';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [LoadingScreenComponent,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  isLoading = true;
  loadingProgress = 0;
}
