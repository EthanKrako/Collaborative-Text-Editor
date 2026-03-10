import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { DocumentStoreService } from "../../services/DocumentStore/document-store.service";

@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrl: 'dashboard.component.css',
    imports: [AsyncPipe]
})
export class Dashboard{
    private router = inject(Router);
    private store = inject(DocumentStoreService);

    documents$ = this.store.documents$;

    openDocument(id: string): void {
        this.store.setActive(id);
        this.router.navigate(['/document', id]);
    }
}