import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
const subscribers = new Set();

export const connectWebSocket = (onMessageReceived) => {
    // Add to subscribers immediately
    subscribers.add(onMessageReceived);

    if (stompClient && stompClient.connected) {
        return;
    }

    // If already connecting, don't start another connection
    // But we need a way to track if we are currently connecting.
    // Let's use a flag.
    if (stompClient && !stompClient.connected) {
        return;
    }

    const socket = new SockJS('http://localhost:8081/ws-rent');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Disable logging

    stompClient.connect({}, () => {
        // Double check if we still have subscribers before subscribing
        if (subscribers.size > 0 && stompClient && stompClient.connected) {
            console.log('Connected to WebSocket');
            
            stompClient.subscribe('/topic/invoices', (message) => {
                try {
                    const invoice = JSON.parse(message.body);
                    subscribers.forEach(callback => callback(invoice));
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e);
                }
            });
        } else {
            // No subscribers left or already disconnected
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
            stompClient = null;
        }
    }, (error) => {
        console.error('WebSocket error:', error);
        // Only retry if there are still interested subscribers
        if (subscribers.size > 0) {
            setTimeout(() => connectWebSocket(), 5000);
        }
    });
};

export const disconnectWebSocket = (onMessageReceived) => {
    if (onMessageReceived) {
        subscribers.delete(onMessageReceived);
    }
    
    if (subscribers.size === 0 && stompClient) {
        if (stompClient.connected) {
            try {
                stompClient.disconnect();
            } catch (e) {
                console.warn('Error during WebSocket disconnect:', e);
            }
        }
        stompClient = null;
    }
};
