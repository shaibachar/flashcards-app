import { Injectable } from '@angular/core';
import { LearningPath } from '../models/LearningPath';

@Injectable({ providedIn: 'root' })
export class LearningPathService {
    private readonly storageKey = 'learningPaths';

    getAll(): LearningPath[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    saveAll(paths: LearningPath[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(paths));
    }

    add(path: LearningPath): void {
        const all = this.getAll();
        all.push(path);
        this.saveAll(all);
    }

    update(path: LearningPath): void {
        const all = this.getAll().map(p => p.id === path.id ? path : p);
        this.saveAll(all);
    }

    delete(id: string): void {
        const all = this.getAll().filter(p => p.id !== id);
        this.saveAll(all);
    }
}
