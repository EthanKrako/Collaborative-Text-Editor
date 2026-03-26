import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { TextDocument } from "../../models/document.model";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrl: 'dashboard.component.css',
    imports: [AsyncPipe]
})
export class Dashboard implements OnInit{
    private router = inject(Router);
    private store = inject(DocumentStoreService);

    documents$ = this.store.documents$;

    ngOnInit(): void {
        this.store.loadDocuments();
    }

    openDocument(id: string): void {
        this.store.setActive(id);
        this.router.navigate(['/document', id]);
    }

    async createDocument(rawTitle: string): Promise<void> {
        const title = rawTitle.trim() || "New Document";

        const newDocumentId = await this.store.create(title);
        this.openDocument(newDocumentId);
    }
}