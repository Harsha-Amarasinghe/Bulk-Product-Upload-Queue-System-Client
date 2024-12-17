import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-product-upload',
  templateUrl: './product-upload.component.html',
  styleUrls: ['./product-upload.component.css']
})
export class ProductUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;  
  successProducts: any[] = [];  
  errorLogs: any[] = [];  
  processingStatus: string = '';  
  isLoading: boolean = false;
  statusUpdates: string[] = [];  
  private websocketSubscription: any;

  constructor(private http: HttpClient, private webSocketService: WebSocketService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.fetchResults();

    this.webSocketService.connect((message: string) => {
      this.ngZone.run(() => {
        this.statusUpdates.push(message);  // Add the message to the array
      });
      this.processingStatus = message;  // Update the latest status message
    });
  }

  ngOnDestroy(): void {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];  
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile); 

    this.processingStatus = 'Processing started...';

    this.http.post('http://localhost:8080/api/products/upload', formData, { responseType: 'text' }).subscribe(
      (response: string) => {
        this.processingStatus = response;  
        this.fetchResults();  
      },
      (error) => {
        console.error(error);
        this.processingStatus = 'Upload failed. Please try again.';
      }
    );
  }

  fetchResults(): void {
    this.isLoading = true;

    this.http.get<any[]>(`http://localhost:8080/api/products/success`).subscribe(
      (data) => {
        this.successProducts = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching success products:', error);
        this.processingStatus = 'Error fetching successful products.';
        this.isLoading = false;
      }
    );

    this.http.get<any[]>(`http://localhost:8080/api/products/errors`).subscribe(
      (data) => (this.errorLogs = data),
      (error) => {
        console.error('Error fetching error logs:', error);
        this.processingStatus = 'Error fetching error logs.';
      }
    );
  }

  downloadReport(reportType:string): void {
    window.location.href = `http://localhost:8080/api/products/report?type=${reportType}`;
  }
}
