import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { TextDocument } from "../../models/document.model";
import { BackendAPIService } from "../BackendAPI/backend-api.service";

@Injectable({
    providedIn: "root"
})
export class DocumentStoreService {
    private documentsSubject = new BehaviorSubject<TextDocument[]>([]);
    private activeDocumentSubject = new BehaviorSubject<TextDocument | null>(null);

    private backendAPIService: BackendAPIService = inject(BackendAPIService);

    documents$ = this.documentsSubject.asObservable();
    activeDocument$ = this.activeDocumentSubject.asObservable();

    loadDocuments(): void {
        this.backendAPIService.getDocuments().subscribe({
            next: (fetchedDocs) => {
                this.documentsSubject.next(fetchedDocs);
            },
            error: (err) => {
                console.error('Failed to load documents:', err);
            }
        });
    }

    getById(id: string): TextDocument | null {
        return this.documentsSubject.value.find(doc => doc.id === id) ?? null;
    }

    async create(title: string): Promise<string> {
        try {
            const createdDoc = await firstValueFrom(
                this.backendAPIService.createDocument(title)
            );
            const updatedDocs = [...this.documentsSubject.value, createdDoc];
            this.documentsSubject.next(updatedDocs);
            this.setActive(createdDoc.id);
            return createdDoc.id;
        } catch (error) {
            console.error('Failed to create document:', error);
            throw error;
        }
    }

    updateContent(id: string, newContent: string): void {
        const current = this.documentsSubject.value;
        const updated = current.map(doc =>
            doc.id === id ? { ...doc, content: newContent, lastModified: new Date() } : doc
        );
        this.documentsSubject.next(updated);
    }

    setActive(id: string): void {
        const doc = this.documentsSubject.value.find(d => d.id === id) ?? null;
        this.activeDocumentSubject.next(doc);
    }
}