import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { QuillModule } from "ngx-quill";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";
import * as Y from 'yjs';
import { SocketService } from "../../services/Socket/socket.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [FormsModule, QuillModule]
})

export class Editor implements OnInit, OnDestroy {
    activatedRoute = inject(ActivatedRoute);
    documentStoreService = inject(DocumentStoreService);
    socketService = inject(SocketService);
    cdr = inject(ChangeDetectorRef);
    editorContent: string = '';
    documentTitle: string = 'Title';
    documentId: string = '';
    ydoc: Y.Doc | null = null;
    ytext: Y.Text | null = null;
    yjsObserver: ((event: Y.YTextEvent) => void) | null = null;
    ydocUpdateHandler: ((update: Uint8Array, origin: unknown) => void) | null = null;
    private subscriptions: Subscription | null = null;


    async ngOnInit(): Promise<void> {
        this.documentId = this.activatedRoute.snapshot.paramMap.get('id') || '';

        if (this.documentId) {
            await this.documentStoreService.ensureActiveDocument(this.documentId);
        }

        this.subscriptions = this.documentStoreService.activeDocument$.subscribe(doc => {
            if (!doc) return;
            this.documentTitle = doc.title;
            this.documentId = doc.id;
            this.cdr.markForCheck();

            this.teardownEditor();
            
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

    private teardownEditor() {
        if (this.yjsObserver) {
            this.ytext?.unobserve(this.yjsObserver);
            this.yjsObserver = null;
        }
        if (this.ydocUpdateHandler) {
            this.ydoc?.off('update', this.ydocUpdateHandler);
            this.ydocUpdateHandler = null;
        }
        this.ydoc?.destroy();
        this.ydoc = null;
        this.ytext = null;
    }

    ngOnDestroy() {
        this.teardownEditor();
        if (this.subscriptions) {
            this.subscriptions.unsubscribe();
        }
    }
}