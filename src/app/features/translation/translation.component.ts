import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { FileSizePipe } from '../../pipe/file-size.pipe';
import { TranslatedFilesDictionary, LanguageRequestModel, UploadedFile } from '../../models/language-request-model';
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
  };   
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; //Non-null Assertion Operator (!)  
  
  uploadInProgress = false;
  uploadProgress = 0;  
  
  uploadedFile: UploadedFile = {
    fileId: '',
    fileData: {
      fileName: '', // Provide the actual file name
      fileSize: 0, // Provide the actual file size
      fileContent: '', // Provide the actual file content
      countTM: 0,
      countMT: 0
    },
    status: ''
  };

  uploadedFiles: UploadedFile[] = []; // Array to store uploaded files

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

    this.uploadedFiles = []; // Clear the uploadedFiles array
    this.translatedFiles = {}; // Clear the translatedFiles dictionary

    console.log("Want to upload files: ", files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      // Track the progress of each file upload
      const fileProgress = {
        totalSize: file.size,
        uploadedSize: 0,
        progress: 0
      };

      this.translationService.uploadFile(formData).subscribe({
        next: (uploadedFile) => {          
          console.log("Uploaded file ID:", uploadedFile);
          this.uploadedFile = uploadedFile;

          // Update the status of the uploaded file to 'Completed' in the uploadedFiles dictionary
          this.uploadedFile.status = 'Completed';       
          
          this.uploadedFiles.push(uploadedFile); // Push uploaded file object to the array
          
          // Increment uploaded size for the current file
          uploadedSize += file.size;
          // Update progress for the current file
          fileProgress.uploadedSize = file.size;
          fileProgress.progress = Math.round((fileProgress.uploadedSize / fileProgress.totalSize) * 100);
          // Update progress for all files
          this.uploadProgress = Math.round((uploadedSize / totalSize) * 100);

          // Check if all files are uploaded
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
          console.log("complete: uploaded files")
          //uploadedSize += file.size;
          //this.uploadProgress = Math.round((uploadedSize / totalSize) * 100);
        }
      })      
    }
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

  translateFiles() { 
    this.loading = true;    
    // Instead loop in front end, just one call to backend and let backend to translate in parallel
    this.translationService.translateFiles(this.model).subscribe({  //this.translationService.translateFiles(this.targetLanguage)
      next: (files) => {
        this.translatedFiles = files;
        console.log('File translated from backend successfully:', this.translatedFiles);        
      },
      error: (error) => {
        console.error('Error translating file from backend:', error);
        this.loading = true;  
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
