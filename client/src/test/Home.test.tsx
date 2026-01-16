import { describe, it, expect } from 'vitest';
import { render, screen as testingScreen } from '@testing-library/react';
import Home from '../pages/Home';
import { Router } from 'wouter';

// screen is not exported from @testing-library/react in some versions
// so we use it via render result
describe('Home Page', () => {
  it('renders system overview title', () => {
    const { container } = render(
      <Router>
        <Home />
      </Router>
    );
    
    expect(container.textContent).toContain('SYSTEM');
    expect(container.textContent).toContain('OVERVIEW');
  });

  it('renders all domain cards', () => {
    const { container } = render(
      <Router>
        <Home />
      </Router>
    );
    
    expect(container.textContent).toContain('ARC 2.0');
    expect(container.textContent).toContain('Security');
    expect(container.textContent).toContain('Finance');
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(
      <Router>
        <Home />
      </Router>
    );
    
    const main = container.querySelector('[role="main"]');
    expect(main).toBeTruthy();
    expect(main?.getAttribute('aria-label')).toBe('System Overview Dashboard');
    
    const nav = container.querySelector('[role="navigation"]');
    expect(nav).toBeTruthy();
    expect(nav?.getAttribute('aria-label')).toBe('Domain navigation grid');
  });
});
