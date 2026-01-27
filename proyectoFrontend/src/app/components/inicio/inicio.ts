import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './inicio.html',
  styleUrls:[ './inicio.css'],
})
export class InicioComponent  {
  

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }
   

  

  
}