import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DocumentService } from './document.service';
import * as Y from 'yjs';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class DocumentGateway implements OnGatewayDisconnect {
    loadedDocuments: Map<string, { doc: Y.Doc, refCount: number, timer: NodeJS.Timeout | null, isDirty: boolean }> = new Map();

    constructor(private readonly documentService: DocumentService) {}
    @SubscribeMessage('join-document')
    async handleJoinDocument(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string }) {
        client.join(`doc-${data.documentId}`);

        let doc: Y.Doc | null = null;
        
        if (this.loadedDocuments.has(data.documentId)) {
            doc = this.loadedDocuments.get(data.documentId)?.doc ?? null;
            this.loadedDocuments.get(data.documentId)!.refCount++;
        } else {
            doc = await this.loadDocumentFromDB(data.documentId);
            if (doc) {
                this.loadedDocuments.set(data.documentId, { doc, refCount: 1, timer: null, isDirty: false });
            }
        }

        if (!doc) { return; }

        const yState = Y.encodeStateAsUpdate(doc);
        client.emit('initial-state', { state: Buffer.from(yState) });
    }

    @SubscribeMessage('update')
    async handleUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: { documentId: string; update: Uint8Array }) {
        const entry = this.loadedDocuments.get(data.documentId);
        if (!entry) return;

        const doc = entry.doc;
        if (!doc) return;
        
        Y.applyUpdate(doc, data.update);
        client.to(`doc-${data.documentId}`).emit('update', { update: data.update });
        
        entry.isDirty = true;

        if (entry.timer) {
            clearTimeout(entry.timer);
        }
        entry.timer = setTimeout(async () => {
            if (entry.isDirty) {
                await this.documentService.updateDocument(data.documentId, doc);
                entry.isDirty = false;
            }
        }, 5000);
    }

    async handleDisconnect(@ConnectedSocket() client: Socket) {
        for (const [documentId, entry] of this.loadedDocuments.entries()) {
            if (client.rooms.has(`doc-${documentId}`)) {
                entry.refCount--;
                if (entry.refCount <= 0) {
                    if (entry.isDirty) {
                        await this.documentService.updateDocument(documentId, entry.doc);
                    }
                    if (entry.timer) {
                        clearTimeout(entry.timer);
                    }
                    this.loadedDocuments.delete(documentId);
                }
            }
        }
    }

    private async loadDocumentFromDB(documentId: string): Promise<Y.Doc | null> {
        const doc = await this.documentService.getDocument(documentId);
        if (!doc) return null;
        
        const ydoc = new Y.Doc();
        Y.applyUpdate(ydoc, doc.yState);
        return ydoc;
    }
}
