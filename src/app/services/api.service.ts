/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://192.168.0.9:5133/api'; // Replace with your API URL
  
  constructor(private http: HttpClient) { }

  getData(data:any): Observable<any> {
    return this.http.get(`${this.baseUrl}/items`, data);
  }

  getAllItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items`);
  }

  getItemById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/${id}`);
  }

  createItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items`, data);
  }

  updateItem(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/items/${id}`, data);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }
}
