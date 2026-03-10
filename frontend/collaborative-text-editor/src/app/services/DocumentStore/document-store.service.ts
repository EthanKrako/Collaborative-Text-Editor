import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { TextDocument } from "../../models/document.model";

@Injectable({
    providedIn: "root"
})
export class DocumentStoreService {
    private documentsSubject = new BehaviorSubject<TextDocument[]>([]);
    private activeDocumentSubject = new BehaviorSubject<TextDocument | null>(null);

    documents$ = this.documentsSubject.asObservable();
    activeDocument = this.activeDocumentSubject.asObservable();

    getAll(): TextDocument[] {
        return this.documentsSubject.value;
    }

    getById(id: string): TextDocument | null {
        return this.documentsSubject.value.find(doc => doc.id === id) ?? null;
    }

    create(document: TextDocument): void {
        const currentDocs = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocs, document]);
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