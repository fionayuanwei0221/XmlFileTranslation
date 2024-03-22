export interface LanguageRequestModel {
    sourceLanguage: string;
    targetLanguage: string;
  }

export interface UploadedFilesDictionary {
    [fileId: string]: File;
}

export interface FileData {
    fileName: string;
    fileContent: string;
  }
  
export  interface TranslatedFilesDictionary {
    [fileId: string]: FileData; // Assuming the translated file content is a string
  }
  