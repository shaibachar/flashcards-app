import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { LearningPathService } from '../services/learning-path.service';
import { LearningPath } from '../models/LearningPath';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, HttpClientModule],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.css'
})
export class LearningPathComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  newPath: LearningPath = { id: '', name: '', description: '', cardIds: [] };

  constructor(private learningPathService: LearningPathService) { }

  ngOnInit(): void {
    this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
  }

  addPath(): void {
    if (this.newPath.name.trim()) {
      this.learningPathService.add(this.newPath).subscribe(() => {
        this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
        this.newPath = { id: '', name: '', description: '', cardIds: [] };
      });
    }
  }

  deletePath(id: string): void {
    this.learningPathService.delete(id).subscribe(() => {
      this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
    });
  }

  updatePath(path: LearningPath): void {
    this.learningPathService.update(path).subscribe(() => {
      this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
    });
  }
}