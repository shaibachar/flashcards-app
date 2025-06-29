import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../services/image.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-image-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-manager.component.html',
  styleUrls: ['./image-manager.component.css']
})
export class ImageManagerComponent implements OnInit {
  images: string[] = [];
  selected: Set<string> = new Set();
  renameMap: Record<string, string> = {};
  apiUrl = environment.apiBaseUrl;

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.imageService.list().subscribe(list => {
      this.images = list;
      this.selected.clear();
      this.renameMap = {};
      this.images.forEach(i => this.renameMap[i] = i);
    });
  }

  onFilesSelected(event: any) {
    const files: File[] = Array.from(event.target.files || []);
    if (files.length) {
      this.imageService.upload(files).subscribe(() => this.load());
    }
    event.target.value = '';
  }

  toggleSelect(name: string, event: any) {
    if (event.target.checked) this.selected.add(name); else this.selected.delete(name);
  }

  delete(name: string) {
    this.imageService.delete(name).subscribe(() => this.load());
  }

  deleteSelected() {
    if (this.selected.size === 0) return;
    this.imageService.deleteMany(Array.from(this.selected)).subscribe(() => this.load());
  }

  rename(oldName: string) {
    const newName = (this.renameMap[oldName] || '').trim();
    if (!newName || newName === oldName) return;
    this.imageService.rename(oldName, newName).subscribe(() => this.load());
  }
}
