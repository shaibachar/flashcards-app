import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashcard-answer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcard-answer.component.html',
  styleUrls: ['./flashcard-answer.component.css']
})
export class FlashcardAnswerComponent implements OnChanges {
  @Input() answer = '';
  @Output() clicked = new EventEmitter<void>();

  isCode = false;
  formatted = '';

  ngOnChanges() {
    this.isCode = this.detectCode(this.answer);
    this.formatted = this.formatAnswer(this.answer);
  }

  private detectCode(text: string): boolean {
    return text.includes('```');
  }

  private formatAnswer(text: string): string {
    let processed = text.replace(/(\d+\.)/g, '\n$1');
    if (processed.startsWith('\n')) {
      processed = processed.slice(1);
    }
    if (this.isCode) {
      processed = processed.replace(/```/g, '').trim();
      processed = this.highlightCode(processed);
    }
    return processed;
  }

  private highlightCode(code: string): string {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const keywords = ['const', 'let', 'function', 'return', 'if', 'else', 'for', 'while'];
    const kwRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    return escaped.replace(kwRegex, '<span class="keyword">$1</span>');
  }

  onClick() {
    this.clicked.emit();
  }
}
