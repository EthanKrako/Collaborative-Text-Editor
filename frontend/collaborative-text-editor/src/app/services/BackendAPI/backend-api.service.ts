import { Injectable } from "@angular/core";
import { TextDocument } from "../../models/document.model";
import { Observable } from "rxjs/internal/Observable";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})
export class BackendAPIService {
    private baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getDocuments(): Observable<TextDocument[]> {
        return this.http.get<TextDocument[]>(`${this.baseUrl}/documents`);
    }

    getDocumentById(id: string): Observable<TextDocument> {
        return this.http.get<TextDocument>(`${this.baseUrl}/documents/${id}`);
    }

    createDocument(title: string): Observable<TextDocument> {
        return this.http.post<TextDocument>(`${this.baseUrl}/documents`, { title });
    }

    deleteDocument(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/documents/${id}`);
    }
}