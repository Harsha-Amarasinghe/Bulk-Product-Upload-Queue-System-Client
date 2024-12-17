import { Injectable } from '@angular/core';
import { Client, IStompSocket, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private client: Client;

  constructor() {
    this.client = new Client();
    this.client.webSocketFactory = () => new SockJS('http://localhost:8080/status') as IStompSocket;
    this.client.reconnectDelay = 5000;
    this.client.debug = (msg: string) => console.log('STOMP Debug:', msg);
  }

  connect(onMessage: (message: string) => void): void {
    this.client.onConnect = () => {
      console.log('Connected to WebSocket');
      this.client.subscribe('/topic/status', (message: Message) => {
        console.log('Received message:', message.body);
        onMessage(message.body);  
      });
    };

    this.client.onDisconnect = () => console.log('Disconnected from WebSocket');
    this.client.activate();
  }

  disconnect(): void {
    this.client.deactivate();
  }
}
