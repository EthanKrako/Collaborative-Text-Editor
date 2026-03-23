import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ValueChangeEvent } from "@angular/forms";
import { QuillModule } from "ngx-quill";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";
import * as Y from 'yjs';
import { SocketService } from "../../services/Socket/socket.service";

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [FormsModule, QuillModule]
})

export class Editor implements OnInit {
    documentStoreService = inject(DocumentStoreService);
    socketService = inject(SocketService);
    editorContent: string = '';
    documentTitle: string = 'Title';
    documentId: string = '';
    ydoc: Y.Doc | null = null;
    ytext: Y.Text | null = null;
    yjsObserver: ((event: Y.YTextEvent) => void) | null = null;
    ydocUpdateHandler: ((update: Uint8Array, origin: unknown) => void) | null = null;

    ngOnInit(): void {
        this.documentStoreService.activeDocument$.subscribe(doc => {
            if (doc) {
                this.documentTitle = doc.title;
                this.documentId = doc.id;
                
                this.ydoc = new Y.Doc();
                this.ytext = this.ydoc.getText('quill-content');

                // Retrieves document content on init
                this.socketService.onInitialState((state) => {
                    if (!this.ydoc) { return; }
                    
                    Y.applyUpdate(this.ydoc, state);
                    this.editorContent = this.ytext?.toString() ?? '';
                });

                // Listen for updates from other clients
                this.socketService.onUpdate((update: Uint8Array) => {
                    if (!this.ydoc) { return; }

                    Y.applyUpdate(this.ydoc, update);
                });

                // Emit updates when local changes occur
                this.ydocUpdateHandler = (update: Uint8Array, origin: unknown) => {
                    if (origin === 'remote') { return; }
                    if (this.documentId) {
                        this.socketService.emitUpdate(this.documentId, update);
                    }
                };

                this.ydoc.on('update', this.ydocUpdateHandler);
                
                this.socketService.joinDocument(doc.id);

                if (this.yjsObserver) {
                    this.ytext.unobserve(this.yjsObserver);
                }

                this.yjsObserver = (event: Y.YTextEvent) => {
                    const newContent = this.ytext!.toString();
                    if (this.editorContent !== newContent) {
                        this.editorContent = newContent;
                    }
                };
                this.ytext.observe(this.yjsObserver);

                this.editorContent = this.ytext.toString();
            }
        })
    }

    onContentChanged(newContent: string) {
        if (this.ytext && newContent !== this.ytext.toString()) {
            this.ytext.delete(0, this.ytext.length);
            this.ytext.insert(0, newContent);

            if (this.documentId) {
                this.documentStoreService.updateContent(this.documentId, newContent);
            }
        }
    }
}