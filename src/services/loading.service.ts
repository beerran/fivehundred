import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoadingService {
    public loadingActive: BehaviorSubject<boolean> = new BehaviorSubject(false);
    constructor() { }

    updateStatus(isLoading: boolean) {
        this.loadingActive.next(isLoading);
    }
}