

export interface UploadedFile {
    fileId: string;
    fileName: string;
    fileSize: number;
    status: string;
    progress?: number; // Optional property to track upload progress
}

export interface FileData {
    fileName: string;
    fileSize: number;
    fileContent: string;
    countTM: number;
    countMT: number;
  }
  
export  interface TranslateFilesData {
  fileIds: string[];
  sourceLanguage: string;
  targetLanguage: string;
}

export  interface TranslatedFilesDictionary {
    [fileId: string]: FileData; // Assuming the translated file content is a string
}
