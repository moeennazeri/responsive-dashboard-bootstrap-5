import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDashbordComponent } from './my-dashbord.component';

describe('MyDashbordComponent', () => {
  let component: MyDashbordComponent;
  let fixture: ComponentFixture<MyDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
