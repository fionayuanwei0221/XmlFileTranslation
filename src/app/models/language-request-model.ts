export interface LanguageRequestModel {
    sourceLanguage: string;
    targetLanguage: string;
  }

export interface UploadedFile {
    fileId: string;
    fileData: FileData;
    status: string;
}

export interface FileData {
    fileName: string;
    fileSize: number;
    fileContent: string;
  }
  
export  interface TranslatedFilesDictionary {
    [fileId: string]: FileData; // Assuming the translated file content is a string
  }
  