import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { HeaderComponent } from './header.component';
import { appRoutes } from '@app/app.routes';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders navigation links with correct labels and routes', () => {
    const links = fixture.debugElement.queryAll(By.css('nav a'));

    expect(links.length).toBe(2);
    expect(links[0].nativeElement.textContent.trim()).toBe('Calculator');
    expect(links[0].nativeElement.getAttribute('href')).toBe('/');
    expect(links[1].nativeElement.textContent.trim()).toBe('Circuit Tools');
    expect(links[1].nativeElement.getAttribute('href')).toBe('/tools');
  });

  it('has role="navigation" and aria-label on nav', () => {
    const nav = fixture.debugElement.query(By.css('nav'));

    expect(nav.nativeElement.getAttribute('role')).toBe('navigation');
    expect(nav.nativeElement.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('has aria-label and aria-expanded on hamburger button', () => {
    const hamburger = fixture.debugElement.query(By.css('.hamburger'));

    expect(hamburger.nativeElement.getAttribute('aria-label')).toBe('Menu');
    expect(hamburger.nativeElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles menu on hamburger click', () => {
    const hamburger = fixture.debugElement.query(By.css('.hamburger'));

    hamburger.nativeElement.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBe(true);
    expect(hamburger.nativeElement.getAttribute('aria-expanded')).toBe('true');

    hamburger.nativeElement.click();
    fixture.detectChanges();
    expect(component.isMenuOpen()).toBe(false);
    expect(hamburger.nativeElement.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes menu on Escape key', () => {
    component.isMenuOpen.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
  });

  it('closes menu on link click', () => {
    component.isMenuOpen.set(true);
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('nav a'));
    link.nativeElement.click();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
  });

  it('applies aria-current="page" for the active route', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/tools']);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = fixture.debugElement.queryAll(By.css('nav a'));

    expect(links[0].nativeElement.getAttribute('aria-current')).toBeNull();
    expect(links[1].nativeElement.getAttribute('aria-current')).toBe('page');
  });
});
