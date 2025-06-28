import { IonicModule } from '@ionic/angular';
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashcard-answer',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './flashcard-answer.component.html',
  styleUrls: ['./flashcard-answer.component.css']
})
export class FlashcardAnswerComponent implements OnChanges {
  @Input() answer = '';
  @Output() clicked = new EventEmitter<void>();

  isCode = false;
  formatted = '';
  alignment: 'left' | 'right' = 'left';

  ngOnChanges() {
    this.isCode = this.detectCode(this.answer);
    this.formatted = this.formatAnswer(this.answer);
    this.alignment = this.detectAlignment(this.answer);
  }

  private detectCode(text: string): boolean {
    return text.includes('```');
  }

  private formatAnswer(text: string): string {
    if (this.isCode) {
      let code = text.replace(/```/g, '').trim();
      return this.highlightCode(code);
    }

    let processed = text.replace(/(\d+\.)/g, '\n$1');
    processed = processed.replace(/\./g, '.\n');
    if (processed.startsWith('\n')) {
      processed = processed.slice(1);
    }
    processed = processed.replace(/\n{2,}/g, '\n');
    processed = this.wrapLongLines(processed.trim());
    return processed;
  }

  private wrapLongLines(text: string, maxChars = 70): string {
    return text
      .split('\n')
      .map((line) => {
        if (line.length <= maxChars) {
          return line;
        }
        const words = line.split(' ');
        let wrapped = '';
        let length = 0;
        for (const word of words) {
          if (length + word.length > maxChars) {
            wrapped = wrapped.trimEnd() + '\n';
            length = 0;
          }
          wrapped += word + ' ';
          length += word.length + 1;
        }
        return wrapped.trimEnd();
      })
      .join('\n');
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

  private detectAlignment(text: string): 'left' | 'right' {
    const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
    const english = (text.match(/[A-Za-z]/g) || []).length;
    return hebrew > english ? 'right' : 'left';
  }
}
