import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileData, TranslateFilesData } from '../models/language-request-model';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';   


@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  apiUrl: string = `${environment.apiBaseUrl}/api/Translation`;   
   
  private hubConnection: HubConnection;  
    private hubUrl: string = 'https://localhost:7098/translationHub'; // Adjust this URL to match your SignalR hub endpoint 

    private subject = new Subject<{ fileId: string, translatedFile: any }>(); 

  constructor(private http: HttpClient) {
    // Configure and build the SignalR hub connection  
    this.hubConnection = new HubConnectionBuilder()  
    .withUrl(this.hubUrl)  
    .configureLogging(LogLevel.Information)  
    .build();  

  // Start the connection  
  this.startConnection();  

  // Register event handlers  
  this.registerEventHandlers(); 
  }
  
  private async startConnection(): Promise<void> {  
    this.hubConnection.start()  
    .then(() => console.log('Connection started'))  
    .catch(err => console.error('Error while starting connection: ' + err));  
  }  

  private registerEventHandlers(): void {  
    this.hubConnection.on('ReceiveFileTranslationStatus', (fileId, translatedFile) => {  
      console.log("translation service: registerEventHandlers()");
      this.subject.next({ fileId, translatedFile });  
    }); 
      // Add other event handlers as needed  
  }

  
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();  
    formData.append('file', file);
    console.log(`${this.apiUrl}/UploadFile`);
    
     return this.http.post<any>(`${this.apiUrl}/UploadFile`, formData, {
       reportProgress: true,
       observe: 'events'
     })
    //return this.http.post<any>(`${this.apiUrl}/UploadFile`, formData);
  }
  
  deleteFile(fileId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/DeleteFile/${fileId}`);
  }  

  translateFiles(data: TranslateFilesData): Observable<any> {
    console.log("service: translateFiles()");
    // Implement translation API call logic here
    const url = `${this.apiUrl}/TranslateFiles`;
    console.log(data);
    console.log(url);
    return this.http.post<any>(url, data);
  }
  
  compareFiles() {
    
  }

// Helper method to allow components to subscribe to translation updates  
public getTranslationUpdates(): Observable<{ fileId: string, translatedFile: FileData }> {  
  console.log("service: getTranslationUpdates()");
  return this.subject.asObservable();  
}  

}
