import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LanguageRequestModel } from '../models/language-request-model';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private http: HttpClient) {}

   apiUrl: string = `${environment.apiBaseUrl}/api/Translation`;
   
  
  uploadFile(formData: FormData): Observable<any> {
    // return this.http.post<any>('https://localhost:7098/api/Translation/UploadFile', formData, {
    //   reportProgress: true,
    //   observe: 'events'
    // })
    console.log(`${this.apiUrl}/UploadFile`);
    return this.http.post<any>(`${this.apiUrl}/UploadFile`, formData);
  }
  
  deleteFile(fileId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/DeleteFile/${fileId}`);
  }

  // translateFile(fileId: string): Observable<any> {
  //   // Implement translation API call logic here
  //   const url = `${this.apiUrl}/TranslateFile`;
  //   const body = {
  //     //sourceLanguage: sourceLanguage,
  //     //targetLanguage: targetLanguage,
  //     fileId: fileId
  //   };
  //   return this.http.post<any>(url, body);
  // }

  translateFiles(model: LanguageRequestModel): Observable<any> {
    // Implement translation API call logic here
    const url = `${this.apiUrl}/TranslateFiles`;
    console.log(model);
    console.log(url);
    return this.http.post<any>(url, model);
  }

  compareFiles() {
    
  }
}
