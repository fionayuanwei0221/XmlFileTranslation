export interface LanguageRequestModel {
    sourceLanguage: string;
    targetLanguage: string;
  }

export interface UploadedFilesDictionary {
    [fileId: string]: FileData;
}

export interface FileData {
    fileName: string;
    fileSize: number;
    fileContent: string;
  }
  
export  interface TranslatedFilesDictionary {
    [fileId: string]: FileData; // Assuming the translated file content is a string
  }
  