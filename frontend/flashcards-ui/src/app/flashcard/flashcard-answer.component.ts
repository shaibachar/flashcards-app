import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightModule } from 'ngx-highlightjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-flashcard-answer',
  standalone: true,
  imports: [CommonModule, HighlightModule],
  templateUrl: './flashcard-answer.component.html',
  styleUrls: ['./flashcard-answer.component.css']
})
export class FlashcardAnswerComponent implements OnChanges {
  @Input() answer = '';
  @Input() image = '';
  @Output() clicked = new EventEmitter<void>();

  isCode = false;
  formatted = '';
  alignment: 'left' | 'right' = 'left';
  apiUrl = environment.apiBaseUrl;

  ngOnChanges() {
    this.isCode = this.detectCode(this.answer);
    this.formatted = this.formatAnswer(this.answer);
    this.alignment = this.detectAlignment(this.answer);
  }

  private detectCode(text: string): boolean {
    if (text.includes('```')) {
      return true;
    }

    const keywords = [
      'const ',
      'let ',
      'var ',
      'function ',
      'class ',
      'def ',
      'return ',
      'import ',
      'from ',
      '#include ',
    ];
    if (keywords.some((kw) => text.includes(kw))) {
      return true;
    }

    if (/[{};]/.test(text)) {
      return true;
    }

    const indentedLines = text
      .split('\n')
      .filter((line) => line.startsWith('    ') || line.startsWith('\t'));
    return indentedLines.length >= 2;
  }

  private formatAnswer(text: string): string {
    if (this.isCode) {
      return text.replace(/```/g, '').trim();
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


  onClick() {
    this.clicked.emit();
  }

  private detectAlignment(text: string): 'left' | 'right' {
    const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
    const english = (text.match(/[A-Za-z]/g) || []).length;
    return hebrew > english ? 'right' : 'left';
  }
}
