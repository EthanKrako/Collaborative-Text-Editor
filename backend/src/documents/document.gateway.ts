import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DocumentService } from './document.service';
import * as Y from 'yjs';

@WebSocketGateway()
export class DocumentGateway {
    loadedDocuments: Map<string, Y.Doc> = new Map();

    constructor(private readonly documentService: DocumentService) {}

    @SubscribeMessage('join-document')
    async handleJoinDocument(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string }) {
        client.join(`doc-${data.documentId}`);
        

        const yState = await this.documentService.getYjsState(data.documentId);
        client.emit('initial-state', { state: yState });
    }

    @SubscribeMessage('update')
    async handleUpdate(client: Socket, @MessageBody() data: { documentId: string; update: Uint8Array }) {
        let doc: Y.Doc | null = null;
        
        if (this.loadedDocuments.has(data.documentId)) {
            doc = this.loadedDocuments.get(data.documentId) ?? null;
        } else {
            doc = await this.loadDocumentFromDB(data.documentId);
            if (doc) {
                this.loadedDocuments.set(data.documentId, doc);
            }
        }

        if (!doc) { return; }
        
        Y.applyUpdate(doc, data.update);
        await this.documentService.updateDocument(data.documentId, doc);
        client.to(`doc-${data.documentId}`).emit('update', { update: data.update });
    }

    private async loadDocumentFromDB(documentId: string): Promise<Y.Doc | null> {
        const ydoc = await this.documentService.getDocument(documentId);
        return ydoc;
    }
}
