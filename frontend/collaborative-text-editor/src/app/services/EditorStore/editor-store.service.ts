import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class EditorStoreService {
    private contentSubject = new BehaviorSubject<string>('');
    contentSubjectObservable: Observable<string> = this.contentSubject.asObservable();

    setContent(newContent: string) {
        this.contentSubject.next(newContent);
    }

    getContent(): string {
        return this.contentSubject.value;
    }
}