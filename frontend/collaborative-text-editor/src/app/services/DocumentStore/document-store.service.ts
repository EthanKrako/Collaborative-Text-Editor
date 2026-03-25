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

    setActive(id: string): void {
        const doc = this.documentsSubject.value.find(d => d.id === id) ?? null;
        this.activeDocumentSubject.next(doc);
    }

    getActive(): TextDocument | null {
        return this.activeDocumentSubject.value;
    }

    getById(id: string): TextDocument | null {
        return this.documentsSubject.value.find(doc => doc.id === id) ?? null;
    }

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

    async ensureActiveDocument(id: string): Promise<void> {
        // Check if document is already in memory
        const existing = this.getById(id);
        if (existing) {
            this.setActive(id);
            return;
        }

        // If not in memory, fetch from backend
        try {
            const doc = await firstValueFrom(
                this.backendAPIService.getDocumentById(id)
            );
            if (!doc) {
                console.warn(`Document with id ${id} not found in backend.`);
                return;
            }
            const updatedDocs = [...this.documentsSubject.value, doc];
            this.documentsSubject.next(updatedDocs);
            this.setActive(id);
        } catch (error) {
            console.error('Failed to load document:', error);
        }
    }
}