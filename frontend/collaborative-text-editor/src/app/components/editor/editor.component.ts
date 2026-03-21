import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ValueChangeEvent } from "@angular/forms";
import { QuillModule } from "ngx-quill";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";
import * as Y from 'yjs';

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [FormsModule, QuillModule]
})

export class Editor implements OnInit {
    documentStoreService = inject(DocumentStoreService);
    editorContent: string = '';
    documentTitle: string = 'Title';
    documentId: string = '';

    ydoc: Y.Doc | null = null;
    ytext: Y.Text | null = null;
    yjsObserver: ((event: Y.YTextEvent) => void) | null = null;

    ngOnInit(): void {
        this.documentStoreService.activeDocument$.subscribe(doc => {
            if (doc) {
                this.documentTitle = doc.title;
                this.documentId = doc.id;
                this.ydoc = new Y.Doc();
                this.ytext = this.ydoc.getText('quill-content');

                if (this.ytext.length === 0 && doc.content) {
                    this.ytext.insert(0, doc.content);
                }
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