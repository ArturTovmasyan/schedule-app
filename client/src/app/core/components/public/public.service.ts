import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PublicService {

  constructor(
    private readonly http: HttpClient
    ) {
    }

}
