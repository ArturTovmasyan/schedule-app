import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams
    .subscribe(params => {
      if (params['code']) {
        this.http.get(`/api/integrations/zoom/oauth/callback?code=${params['code']}`)
          .pipe(first())
          .subscribe({
            next: (data) => {
              console.log(data)
              this.router.navigate(['/integrations/zoom'], { queryParams: { success: true } })
            },
            error: (err) => {
              this.router.navigate(['/integrations/zoom'])
            }
          });
      }
    });
  }
}
