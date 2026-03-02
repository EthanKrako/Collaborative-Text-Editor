import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { QuillModule } from "ngx-quill";

@Component({
    selector: 'app-editor',
    templateUrl: 'editor.component.html',
    styleUrl: 'editor.component.css',
    imports: [FormsModule, QuillModule]
})

export class Editor {
    editorContent: string = '';
}