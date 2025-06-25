import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SamplescreenComponent} from "./samplescreen.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('SamplescreenComponent', () => {
  let fixture: ComponentFixture<SamplescreenComponent>;
  let component: SamplescreenComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SamplescreenComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(SamplescreenComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
