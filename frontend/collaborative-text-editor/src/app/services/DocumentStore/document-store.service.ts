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

    create(title: string): string {
        const currentDocs = this.documentsSubject.value;
        let newId = Math.random().toString(36).substring(2, 9);
        while (currentDocs.some(doc => doc.id === newId)) {
            newId = Math.random().toString(36).substring(2, 9);
        }
        const newDocument: TextDocument = {
            id: newId,
            title: title,
            content: "",
            lastModified: new Date()
        }

        this.documentsSubject.next([...currentDocs, newDocument]);
        return newId;
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