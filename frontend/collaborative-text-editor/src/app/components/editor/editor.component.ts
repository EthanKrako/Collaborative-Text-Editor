import { Component, inject, OnInit } from "@angular/core";
import { FormsModule, ValueChangeEvent } from "@angular/forms";
import { QuillModule } from "ngx-quill";
import { EditorStoreService } from "../../services/EditorStore/editor-store.service";

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [FormsModule, QuillModule]
})

export class Editor implements OnInit {
    editorStoreService = inject(EditorStoreService);
    editorContent: string = '';
    documentTitle: string = 'Document Title';

    ngOnInit(): void {
        this.editorStoreService.contentSubjectObservable.subscribe(value => {
            this.editorContent = value;
        })
    }

    onContentChanged(newContent: string) {
        this.editorStoreService.setContent(newContent);
        console.log('Content updated in store:', this.editorStoreService.getContent());
    }
}