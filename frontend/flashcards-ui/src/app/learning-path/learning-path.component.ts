import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { LearningPathService } from '../services/learning-path.service';
import { LearningPath } from '../models/LearningPath';


@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.css'
})
export class LearningPathComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  newPath: LearningPath = { id: '', name: '', description: '', cardIds: [] };

  constructor(private learningPathService: LearningPathService) { }

  ngOnInit(): void {
    this.learningPaths = this.learningPathService.getAll();
  }

  addPath(): void {
    if (this.newPath.name.trim()) {
      this.newPath.id = crypto.randomUUID();
      this.learningPathService.add(this.newPath);
      this.learningPaths = this.learningPathService.getAll();
      this.newPath = { id: '', name: '', description: '', cardIds: [] };
    }
  }

  deletePath(id: string): void {
    this.learningPathService.delete(id);
    this.learningPaths = this.learningPathService.getAll();
  }

  updatePath(path: LearningPath): void {
    this.learningPathService.update(path);
    this.learningPaths = this.learningPathService.getAll();
  }
}