import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { FileSizePipe } from '../../pipe/file-size.pipe';
import { TranslatedFilesDictionary, LanguageRequestModel, UploadedFilesDictionary } from '../../models/language-request-model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.css'
})

@Injectable()
export class TranslationComponent {
[x: string]: any;

  loading: boolean;
  model: LanguageRequestModel;

  constructor(private translationService: TranslationService, private router: Router) {
     
    this.loading = false;
    this.model = {
      sourceLanguage: 'English',
      targetLanguage: 'Chinese'
    }
    console.log(this.model);
  };   
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; //Non-null Assertion Operator (!)  
  
  uploadInProgress = false;
  uploadProgress = 0;
  
  uploadedFiles: UploadedFilesDictionary = {};
  translatedFiles: TranslatedFilesDictionary = {}; 

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
    this.uploadInProgress = true;
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    let uploadedSize = 0;

    //console.log("uploadFiles");
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      this.translationService.uploadFile(formData).subscribe({
        next: (uploadedFiles) => {
          console.log("uploaded successfully");
          console.log("Uploaded file ID:", uploadedFiles);
          this.uploadedFiles = uploadedFiles;
          console.log("UploadedFiles after assignment:", this.uploadedFiles); // Verify the contents of uploadedFiles
          
          if (i === files.length - 1) {
            this.uploadInProgress = false;
          }
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          if (i === files.length - 1) {
            this.uploadInProgress = false;
          }
        },
        complete: () => {
          console.log("uploaded files")
          console.log(this.uploadedFiles)
          console.log(files);
          uploadedSize += file.size;
          this.uploadProgress = Math.round((uploadedSize / totalSize) * 100);
        }
      })      
    }
  }

  deleteFile(fileId: string) {
    // Check if the fileId exists in the uploadedFiles dictionary
    if (this.uploadedFiles[fileId]) {
      // Remove the file using the fileId as the key
      delete this.uploadedFiles[fileId];

      // Call backend API to delete the file from the dictionary
      this.translationService.deleteFile(fileId).subscribe({
          next: () => {
            console.log('File deleted from backend successfully');
          },
          error: (error) => {
            console.error('Error deleting file from backend:', error);
          },
          complete: ()=> {}
        }
      );
    }
  }

  translateFiles() { 
    this.loading = true;    
    // Instead loop in front end, just one call to backend and let backend to translate in parallel
    this.translationService.translateFiles(this.model).subscribe({  //this.translationService.translateFiles(this.targetLanguage)
      next: (files) => {
        console.log('File translated from backend successfully');
        this.translatedFiles = files;
        console.log(this.translatedFiles);
      },
      error: (error) => {
        //console.error('Error translating file from backend:', error);
      },
      complete: ()=> {
        console.log("complete")
        this.loading = false;
      }
    })    
  }  

  viewFile(fileId: string) {
    // Get the current URL of the home page
    const currentUrl = window.location.origin;
    // Construct the URL for the comparison page
    const comparisonPageUrl = `${currentUrl}/comparison`;

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
