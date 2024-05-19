import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs';
import { ApiResponse } from 'src/app/core/interfaces/response/api.response.interface';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  integrateZoom() {
    this.http.post<ApiResponse<any>>('/api/integrations/zoom/oauth', {})
    .pipe(first())
    .subscribe({
      next: (data) => {
        window.location.href = data.data['url'];
      },
      error: (err) => {
        console.error(err)
      }
    });
  }
}
