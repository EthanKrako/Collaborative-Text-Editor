import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

type BinaryPayload = { state?: number[] | ArrayBuffer; update?: number[] | ArrayBuffer };

@Injectable({ 
    providedIn: 'root' 
})
export class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io('http://localhost:3000');
    }

    joinDocument(documentId: string) {
        this.socket.emit('join-document', { documentId });
    }

    onInitialState(handler: (state: Uint8Array) => void): () => void {
        return this.onBinaryEvent('initial-state', 'state', handler, true);
    }

    onUpdate(handler: (update: Uint8Array) => void): () => void {
        return this.onBinaryEvent('update', 'update', handler);
    }

    emitUpdate(documentId: string, update: Uint8Array) {
        this.socket.emit('update', { documentId, update: new Uint8Array(update) });
    }

    private onBinaryEvent(eventName: string, field: 'state' | 'update', handler: (data: Uint8Array) => void, once = false): () => void {
        const listener = (payload: BinaryPayload) => {
            const raw = payload[field];
            if (!raw) return;
            handler(new Uint8Array(raw));
        };

        if (once) {
            this.socket.once(eventName, listener);
        } else {
            this.socket.on(eventName, listener);
        }

        // Return a function to remove this specific listener from this event
        return () => this.socket.off(eventName, listener);
    }
}