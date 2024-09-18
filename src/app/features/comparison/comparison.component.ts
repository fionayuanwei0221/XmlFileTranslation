import { Component, OnInit } from '@angular/core';
//import * as Diff from 'diff';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrl: './comparison.component.css'
})
export class ComparisonComponent implements OnInit{
  fileId: string | null = null;  
  
  constructor(private activatedRoute: ActivatedRoute) {}  
  
  ngOnInit(): void {  
    this.activatedRoute.queryParams.subscribe(params => {  
      this.fileId = params['fileId'];  
      // Once you have the fileId, fetch the files and compare them  
      this.fetchAndCompareFiles(this.fileId);  
    });  
  }  
  
  fetchAndCompareFiles(fileId: string | null) {  
    if (!fileId) return;  
  
    // Fetch the uploaded file and translated file based on fileId  
    // This is a simplified example. You might need to call your backend API  
    // and handle asynchronous operations with observables or promises.  
  }
}
