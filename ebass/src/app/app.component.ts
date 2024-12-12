import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ebass';

  http = inject(HttpClient);

  constructor() {
    // this.http.get('https://www.amfiindia.com/spages/NAVAll.txt').subscribe((res) => {
    //   console.log(res);
    // });
    
  }
}
