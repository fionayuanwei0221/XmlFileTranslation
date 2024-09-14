import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { TranslateFilesData } from '../models/language-request-model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';   


@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private hubConnection: HubConnection;  
    private hubUrl: string = '/translationHub'; // Adjust this URL to match your SignalR hub endpoint 

    private subject = new Subject<{ fileId: string, translatedFile: any }>(); 

  constructor(private http: HttpClient) {
    // Configure and build the SignalR hub connection  
    this.hubConnection = new HubConnectionBuilder()  
    .withUrl(this.hubUrl)  
    .build();  

  // Start the connection  
  this.startConnection();  

  // Register event handlers  
  this.registerEventHandlers(); 
  }

   apiUrl: string = `${environment.apiBaseUrl}/api/Translation`;   
   
  
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
    // Implement translation API call logic here
    const url = `${this.apiUrl}/TranslateFiles`;
    console.log(data);
    console.log(url);
    return this.http.post<any>(url, data);
  }
  
  compareFiles() {
    
  }

  // Assuming you have initialized the SignalR connection somewhere in the service  
public startListeningForTranslationUpdates(): void {  
  this.hubConnection.on('ReceiveTranslationStatus', (fileId, translatedFile) => {  
      this.subject.next({ fileId, translatedFile });  
  });  
}  

// Helper method to allow components to subscribe to translation updates  
public getTranslationUpdates(): Observable<{ fileId: string, translatedFile: any }> {  
  return this.subject.asObservable();  
}  

  private async startConnection(): Promise<void> {  
    try {  
        await this.hubConnection.start();  
        console.log('SignalR Connection successfully started');  
    } catch (err) {  
        console.error('Error while starting SignalR connection: ', err);  
        // Optionally implement a retry logic  
    }  
  }  

  private registerEventHandlers(): void {  
      // Example: Registering an event handler for receiving translation status updates  
      this.hubConnection.on('ReceiveTranslationStatus', (message: string) => {  
          console.log('Translation Status: ', message);  
          // Here, you can implement additional logic to handle the message,  
          // such as updating the UI or state in your application.  
      });  

      // Add other event handlers as needed  
  }
}
