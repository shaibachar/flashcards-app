import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardAdminComponent } from './flashcard-admin.component';

describe('FlashcardAdminComponent', () => {
  let component: FlashcardAdminComponent;
  let fixture: ComponentFixture<FlashcardAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashcardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
