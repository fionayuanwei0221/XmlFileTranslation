import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { TranslatedFilesDictionary, UploadedFile, TranslateFilesData, FileData } from '../../models/language-request-model';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({  
  selector: 'app-translation',  
  templateUrl: './translation.component.html',  
  styleUrls: ['./translation.component.css'] // Correct property name and use an array  
}) 

@Injectable()
export class TranslationComponent {
[x: string]: any;

  loading: boolean; 
  pendingTranslations: Set<string> = new Set(); // Here's the declaration 
  translateFilesData: TranslateFilesData;  

  constructor(private translationService: TranslationService, private router: Router) {
     
    this.loading = false;
    this.translateFilesData = {
      fileIds: [],
      sourceLanguage: 'English',
      targetLanguage: 'Chinese'
    };
  };   
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; //Non-null Assertion Operator (!)  
  
  uploadInProgress = false;
  uploadProgress = 0;  
  
  uploadedFile: UploadedFile = {
    fileId: '',
    fileName: '',
    fileSize: 0,    
    status: '',
    progress: 0 // Initial progress is 0%  
  };

  uploadedFiles: UploadedFile[] = []; // Array to store uploaded files

  // for return multiple files that are translated at a time.
  translatedFiles: { [fileId: string]: FileData } = {}; // If you choose to use a dictionary 
    
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();

    // add a type assertion to ensure that the files variable is not null before passing it to the handleFiles method.
    // you can do this using the non-null assertion operator (!) or a guard clause. 
    
    const files = event.dataTransfer?.files; //optional chaining (?.)
    if (files){    
      this.uploadFiles(files);
    }    
  }

  browseFiles() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files){
      this.uploadFiles(files);
    }    
  }

  uploadFiles(files: FileList) {    
    if (!files.length) return;    
    
    this.uploadInProgress = true;    
    this.uploadedFiles = []; // Reset the uploadedFiles array for new uploads    
    
    Array.from(files).forEach((file) => {    
      const uploadedFile: UploadedFile = {    
        fileId: '',    
        fileName: file.name,    
        fileSize: file.size,    
        status: 'Uploading',    
        progress: 0, // Initial progress is 0%    
      };  
      this.uploadedFiles.push(uploadedFile); // Add to the array for tracking  
        
      this.translationService.uploadFile(file).subscribe({    
        next: (event) => {    
          const fileToUpdate = this.uploadedFiles.find(f => f.fileName === file.name);  
          if (!fileToUpdate) return; // Safeguard against undefined  
            
          if (event.type === HttpEventType.UploadProgress && event.total) {    
            const progress = Math.round((100 * event.loaded) / event.total);    
            fileToUpdate.progress = progress; // Safely update progress    
          } else if (event.type === HttpEventType.Response) {    
            fileToUpdate.status = 'Completed';    
            fileToUpdate.progress = 100; // Ensure progress is set to 100%    
            // Assuming the server returns the fileId in the body of the response  
            fileToUpdate.fileId = event.body.fileId; // Set fileId from the response 
          }    
        },    
        error: (error) => {    
          console.error('Upload failed for file:', file.name, error);    
          const fileToUpdate = this.uploadedFiles.find(f => f.fileName === file.name);  
          if (fileToUpdate) {  
            fileToUpdate.status = 'Failed';    
            fileToUpdate.progress = 0; // Reset progress on failure    
          }  
        },    
        complete: () => {    
          // Additional completion logic if needed    
        },    
      });    
    });    
  }  

  deleteFile(fileId: string) {
    this.translationService.deleteFile(fileId).subscribe({
      next: (response) => {
        console.log('File deleted successfully:', fileId);
        // Remove the deleted file from the uploadedFiles array
        this.uploadedFiles = this.uploadedFiles.filter(file => file.fileId !== fileId);
      },
      error: (error) => {
        console.error('Error deleting file:', error);
      }
    });
  }

  // When user clicks 'Translate' button or triggers translation action  
onTranslateRequest() {  
  console.log("OnTranslateRequest()");
  this.translateFiles(); // Initiates translation request  
  this.listenForTranslationUpdates(); // Starts listening for updates  
} 

  translateFiles() {  
    this.loading = true;      

    // Reset or initialize the tracking structure  
  this.pendingTranslations = new Set(this.uploadedFiles.map(file => file.fileId));

    this.translateFilesData.fileIds = Array.from(this.pendingTranslations);  
    console.log("File Ids to translate:", this.translateFilesData);
  
    // Send the translateFilesData to the backend to start the translation process  
    this.translationService.translateFiles(this.translateFilesData).subscribe({  
        next: (response) => {  
            console.log("Translation process initiated:", response);  
            // The backend might return an immediate acknowledgment here  
        },  
        error: (error) => {  
            console.error('Error initiating translation process:', error);  
             
        },  
        complete: () => {  
            console.log("Translation request sent.");  
            // Don't set loading to false here as translations are still pending
        }  
    });  
}

listenForTranslationUpdates() {  
  this.translationService.getTranslationUpdates().subscribe({  
      next: (update) => {  
          // Assuming update is an object like { fileId: "id2", translatedFile: {...} }  
          const { fileId, translatedFile } = update;  
          this.translatedFiles[fileId] = translatedFile; // Update your local state or model  
          console.log(`File ${fileId} translated and received:`, translatedFile);  

          // Remove the fileId from the pending set  
          this.pendingTranslations.delete(fileId);  
          
          // Check if all files are translated  
          if (this.pendingTranslations.size === 0) {  
            this.loading = false;  
            console.log("All files have been translated.");  
          }  
      },  
      error: (error) => {  
          console.error('Error receiving translation update:', error);  
      },  
      complete: () => {  
          console.log("All translation updates received.");  
          // This might not be called depending on your real-time communication setup  
      }  
  });  
}
  
get translatedFilesArray() {  
  return Object.entries(this.translatedFiles).map(([fileId, translatedFile]) => ({  
    fileId,  
    translatedFile  
  }));  
}

  viewFile(fileId: string) {
    // Get the current URL of the home page
    const currentUrl = window.location.origin;
    // Construct the URL for the comparison page
    const comparisonPageUrl = `${currentUrl}/comparison?fileId=${fileId}`;

    // const reader = new FileReader();
    // const originalContent = this.getUploadFileContent(this.uploadedFiles[fileId]);; // Content of the original file
    // const translatedContent = this.translatedFiles[fileId].fileContent; // Content of the translated file

    // this.router.navigate(['/comparison'], {
    //   queryParams: {
    //     originalContent,
    //     translatedContent
    //   }
    // });

    // Open a new window/tab with the comparison page
    window.open(comparisonPageUrl, '_blank');
    // If you need to pass the fileId, adjust as needed  
    //this.router.navigate(['/comparison'], { queryParams: { fileId: fileId } });
  }

  // private getUploadFileContent(file: File){
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const fileContent = reader.result as string;
  //     console.log(fileContent); // This will log the content of the file as a string
  //   };
  //   reader.readAsText(file);
  // }

  downloadFile(fileId: string) {

    const fileName = this.translatedFiles[fileId].fileName;
    const fileContent = this.translatedFiles[fileId].fileContent;

    // Convert the file content to a Uint8Array with UTF-8 encoding
    var utf8Bytes = new TextEncoder().encode(fileContent);

    // Create a blob from the file content
    var blob = new Blob([utf8Bytes], { type: 'text/xml;charset=utf-8' });

    // Create a link element
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName; // Set the filename with .xml extension

    // Append the link to the document body
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
}
