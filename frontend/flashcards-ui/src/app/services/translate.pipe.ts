import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private ts: TranslationService) {}
  transform(value: string): string {
    return this.ts.t(value);
  }
}
