import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ValueChangeEvent } from "@angular/forms";
import { QuillModule } from "ngx-quill";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";

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
    documentId: string = ''

    ngOnInit(): void {
        this.documentStoreService.activeDocument$.subscribe(doc => {
            if (doc) {
                this.editorContent = doc.content;
                this.documentTitle = doc.title;
                this.documentId = doc.id;
            }
        })
    }

    onContentChanged(newContent: string) {
        if (this.documentId) {
            this.documentStoreService.updateContent(this.documentId, newContent);
        }
    }
}