import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";
import { SocketService } from "../../services/Socket/socket.service";
import Quill from "quill";
import { QuillModule } from "ngx-quill";
import * as Y from 'yjs';
import { QuillBinding } from "y-quill";

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [QuillModule]
})

export class Editor implements OnInit, OnDestroy {
    activatedRoute = inject(ActivatedRoute);
    documentStoreService = inject(DocumentStoreService);
    socketService = inject(SocketService);
    cdr = inject(ChangeDetectorRef);

    documentTitle: string = 'Title';
    documentId: string = '';
    editor: Quill | null = null;
    quillYjsBinding: QuillBinding | null = null;
    ydoc: Y.Doc | null = null;
    ytext: Y.Text | null = null;

    ydocUpdateHandler: ((update: Uint8Array, origin: unknown) => void) | null = null;
    private subscription: Subscription | null = null;
    private editorListenersCleanupFunctions: (() => void)[] = [];

    async ngOnInit(): Promise<void> {
        this.documentId = this.activatedRoute.snapshot.paramMap.get('id') || '';

        if (this.documentId) {
            await this.documentStoreService.ensureActiveDocument(this.documentId);
        }

        this.subscription = this.documentStoreService.activeDocument$.subscribe(doc => {
            if (!doc) return;
            this.documentTitle = doc.title;
            this.documentId = doc.id;
            this.cdr.markForCheck();

            this.teardownEditor();
            
            this.ydoc = new Y.Doc();
            this.ytext = this.ydoc.getText('quill-content');

            // Retrieves document content on init
            this.editorListenersCleanupFunctions.push(this.socketService.onInitialState((state) => {
                if (!this.ydoc) { return; }
                
                Y.applyUpdate(this.ydoc, state, 'remote');
                this.setupBindingIfReady();
            }));

            // Listen for updates from other clients
            this.editorListenersCleanupFunctions.push(this.socketService.onUpdate((update: Uint8Array) => {
                if (!this.ydoc) { return; }

                Y.applyUpdate(this.ydoc, update, 'remote');
            }));

            // Emit updates when local changes occur
            this.ydocUpdateHandler = (update: Uint8Array, origin: unknown) => {
                if (origin === 'remote') { return; }
                if (this.documentId) {
                    this.socketService.emitUpdate(this.documentId, update);
                }
            };

            this.ydoc.on('update', this.ydocUpdateHandler);
            
            this.socketService.joinDocument(doc.id);
        })
    }

    onEditorCreated(editor: Quill) {
        this.editor = editor;
        this.setupBindingIfReady();
    }

    ngOnDestroy() {
        this.teardownEditor();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private teardownEditor() {
        this.editorListenersCleanupFunctions.forEach(cleanup => cleanup());
        this.editorListenersCleanupFunctions = [];
        if (this.ydocUpdateHandler) {
            this.ydoc?.off('update', this.ydocUpdateHandler);
            this.ydocUpdateHandler = null;
        }
        this.ydoc?.destroy();
        this.ydoc = null;
        this.ytext = null;
        this.quillYjsBinding?.destroy();
        this.quillYjsBinding = null;
    }

    private setupBindingIfReady() {
        if (!this.editor || !this.ytext || this.quillYjsBinding) return;
        this.quillYjsBinding = new QuillBinding(this.ytext, this.editor);
    }
}