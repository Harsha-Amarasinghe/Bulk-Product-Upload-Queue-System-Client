import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-product-upload',
  templateUrl: './product-upload.component.html',
  styleUrls: ['./product-upload.component.css']
})
export class ProductUploadComponent implements OnInit, OnDestroy {
  selectedFile: File | null = null;  // Selected file for upload
  successProducts: any[] = [];  // Array to store successfully processed products
  errorLogs: any[] = [];  // Array to store error logs
  processingStatus: string = '';  // Status message for upload progress
  isLoading: boolean = false;
  statusUpdates: string[] = [];  // Array to store real-time updates
  private websocketSubscription: any;

  constructor(private http: HttpClient, private webSocketService: WebSocketService, private ngZone: NgZone) {}

  ngOnInit(): void {
    // Fetch initial results when the component loads
    this.fetchResults();

    // Connect to WebSocket to receive processing status updates
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

  // Handle file selection event
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];  // Store the selected file
  }

  // Upload the selected file to the backend
  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);  // Append the selected file to form data

    // Update the processing status
    this.processingStatus = 'Processing started...';

    // Make a POST request to upload the file
    this.http.post('http://localhost:8080/api/products/upload', formData, { responseType: 'text' }).subscribe(
      (response: string) => {
        this.processingStatus = response;  // Handle plain text response
        this.fetchResults();  // Fetch results after successful upload
      },
      (error) => {
        console.error(error);
        this.processingStatus = 'Upload failed. Please try again.';
      }
    );
  }

  // Fetch success and error results from the backend
  fetchResults(): void {
    this.isLoading = true;

    // Fetch success products
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

    // Fetch error logs
    this.http.get<any[]>(`http://localhost:8080/api/products/errors`).subscribe(
      (data) => (this.errorLogs = data),
      (error) => {
        console.error('Error fetching error logs:', error);
        this.processingStatus = 'Error fetching error logs.';
      }
    );
  }

  // Download the error report from the backend
  downloadReport(reportType:string): void {
    // Trigger a file download
    window.location.href = `http://localhost:8080/api/products/report?type=${reportType}`;
  }
}
