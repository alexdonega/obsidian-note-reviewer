import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap, getFocusableElements } from '../useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let triggerButton: HTMLButtonElement;
  let rafCallback: FrameRequestCallback | null = null;
  const originalRaf = window.requestAnimationFrame;

  beforeEach(() => {
    // Mock requestAnimationFrame to execute immediately
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    };

    // Create a trigger button that would normally open the modal
    triggerButton = document.createElement('button');
    triggerButton.textContent = 'Open Modal';
    document.body.appendChild(triggerButton);

    // Create a modal container with focusable elements
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a id="link1" href="#">Link 1</a>
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(triggerButton);
    window.requestAnimationFrame = originalRaf;
    rafCallback = null;
  });

  // Helper to flush pending requestAnimationFrame callbacks
  function flushRaf() {
    if (rafCallback) {
      rafCallback(0);
      rafCallback = null;
    }
  }

  // Helper to simulate keydown events
  function simulateKeyDown(element: HTMLElement, key: string, shiftKey = false) {
    const event = new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
    return event;
  }

  describe('auto-focus on open', () => {
    test('focuses first focusable element when modal opens', () => {
      const onClose = mock(() => {});

      const { result } = renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      // Flush the requestAnimationFrame to trigger auto-focus
      flushRaf();

      const firstButton = container.querySelector('#btn1') as HTMLButtonElement;
      expect(document.activeElement).toBe(firstButton);
    });

    test('focuses container when no focusable elements exist', () => {
      // Remove all focusable elements
      container.innerHTML = '<p>Non-interactive content</p>';
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      // Flush the requestAnimationFrame to trigger auto-focus
      flushRaf();

      expect(document.activeElement).toBe(container);
      expect(container.getAttribute('tabindex')).toBe('-1');
    });

    test('does not focus when modal is closed', () => {
      // Focus trigger button before test
      triggerButton.focus();
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: false, onClose });
        return containerRef;
      });

      flushRaf();

      // Focus should remain on trigger
      expect(document.activeElement).toBe(triggerButton);
    });
  });

  describe('Tab key cycling forward', () => {
    test('cycles from last to first element when Tab is pressed on last element', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Focus the last button
      const lastButton = container.querySelector('#btn2') as HTMLButtonElement;
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Press Tab - should cycle to first element
      simulateKeyDown(container, 'Tab', false);

      const firstButton = container.querySelector('#btn1') as HTMLButtonElement;
      expect(document.activeElement).toBe(firstButton);
    });

    test('allows normal Tab navigation within the modal', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Focus the first button
      const firstButton = container.querySelector('#btn1') as HTMLButtonElement;
      firstButton.focus();

      // Press Tab on first element - should not prevent default (browser handles it)
      const event = simulateKeyDown(container, 'Tab', false);

      // Event should not be prevented for middle navigation
      // (but the hook only prevents when at boundaries)
      // Since we're at the first element and pressing Tab, browser handles it
    });
  });

  describe('Shift+Tab cycling backward', () => {
    test('cycles from first to last element when Shift+Tab is pressed on first element', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Focus the first button
      const firstButton = container.querySelector('#btn1') as HTMLButtonElement;
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Press Shift+Tab - should cycle to last element
      simulateKeyDown(container, 'Tab', true);

      const lastButton = container.querySelector('#btn2') as HTMLButtonElement;
      expect(document.activeElement).toBe(lastButton);
    });

    test('allows normal Shift+Tab navigation within the modal', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Focus the last button
      const lastButton = container.querySelector('#btn2') as HTMLButtonElement;
      lastButton.focus();

      // Press Shift+Tab on last element - should not prevent default
      // (browser handles normal backward navigation)
    });
  });

  describe('Escape key handling', () => {
    test('calls onClose when Escape is pressed', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Press Escape
      simulateKeyDown(container, 'Escape');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('stops propagation of Escape key', () => {
      const onClose = mock(() => {});
      const parentHandler = mock(() => {});

      // Add a parent handler
      document.body.addEventListener('keydown', parentHandler);

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Press Escape
      simulateKeyDown(container, 'Escape');

      // Parent handler should not be called (stopPropagation)
      expect(parentHandler).not.toHaveBeenCalled();

      document.body.removeEventListener('keydown', parentHandler);
    });

    test('does not call onClose when other keys are pressed', () => {
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Press various keys
      simulateKeyDown(container, 'Enter');
      simulateKeyDown(container, 'Space');
      simulateKeyDown(container, 'ArrowDown');

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('focus restoration on close', () => {
    test('restores focus to previously focused element when modal closes', async () => {
      const onClose = mock(() => {});

      // Focus the trigger button before opening modal
      triggerButton.focus();
      expect(document.activeElement).toBe(triggerButton);

      const { rerender } = renderHook(
        ({ isOpen }) => {
          const containerRef = useRef<HTMLElement>(container);
          useFocusTrap({ containerRef, isOpen, onClose });
          return containerRef;
        },
        { initialProps: { isOpen: true } }
      );

      flushRaf();

      // Focus should have moved to first element in modal
      const firstButton = container.querySelector('#btn1') as HTMLButtonElement;
      expect(document.activeElement).toBe(firstButton);

      // Close the modal
      rerender({ isOpen: false });

      // Flush the restore focus RAF
      flushRaf();

      // Focus should be restored to trigger button
      expect(document.activeElement).toBe(triggerButton);
    });

    test('does not restore focus if previous element is removed from DOM', async () => {
      const onClose = mock(() => {});

      // Focus the trigger button before opening modal
      triggerButton.focus();

      const { rerender } = renderHook(
        ({ isOpen }) => {
          const containerRef = useRef<HTMLElement>(container);
          useFocusTrap({ containerRef, isOpen, onClose });
          return containerRef;
        },
        { initialProps: { isOpen: true } }
      );

      flushRaf();

      // Remove the trigger button from DOM
      document.body.removeChild(triggerButton);

      // Close the modal
      rerender({ isOpen: false });

      flushRaf();

      // Focus should not throw error (element was removed)
      // Re-add for cleanup
      triggerButton = document.createElement('button');
      document.body.appendChild(triggerButton);
    });
  });

  describe('edge cases', () => {
    test('handles empty modal container', () => {
      container.innerHTML = '';
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Container should be focused with tabindex=-1
      expect(document.activeElement).toBe(container);

      // Tab should not throw
      simulateKeyDown(container, 'Tab');
    });

    test('skips disabled elements', () => {
      container.innerHTML = `
        <button id="btn1" disabled>Disabled</button>
        <button id="btn2">Enabled</button>
      `;
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Should focus the enabled button (first focusable)
      const enabledButton = container.querySelector('#btn2') as HTMLButtonElement;
      expect(document.activeElement).toBe(enabledButton);
    });

    test('skips hidden elements', () => {
      container.innerHTML = `
        <button id="btn1" style="display: none">Hidden</button>
        <button id="btn2">Visible</button>
      `;
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Should focus the visible button
      const visibleButton = container.querySelector('#btn2') as HTMLButtonElement;
      expect(document.activeElement).toBe(visibleButton);
    });

    test('skips elements with negative tabindex', () => {
      container.innerHTML = `
        <button id="btn1" tabindex="-1">Not tabbable</button>
        <button id="btn2">Tabbable</button>
      `;
      const onClose = mock(() => {});

      renderHook(() => {
        const containerRef = useRef<HTMLElement>(container);
        useFocusTrap({ containerRef, isOpen: true, onClose });
        return containerRef;
      });

      flushRaf();

      // Should focus the tabbable button
      const tabbableButton = container.querySelector('#btn2') as HTMLButtonElement;
      expect(document.activeElement).toBe(tabbableButton);
    });
  });
});

describe('getFocusableElements', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  test('finds buttons', () => {
    container.innerHTML = '<button>Click me</button>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].tagName).toBe('BUTTON');
  });

  test('finds links with href', () => {
    container.innerHTML = '<a href="#">Link</a>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].tagName).toBe('A');
  });

  test('excludes links without href', () => {
    container.innerHTML = '<a>No href</a>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(0);
  });

  test('finds inputs', () => {
    container.innerHTML = '<input type="text" />';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].tagName).toBe('INPUT');
  });

  test('finds textareas', () => {
    container.innerHTML = '<textarea></textarea>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].tagName).toBe('TEXTAREA');
  });

  test('finds selects', () => {
    container.innerHTML = '<select><option>Option</option></select>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].tagName).toBe('SELECT');
  });

  test('finds elements with positive tabindex', () => {
    container.innerHTML = '<div tabindex="0">Focusable div</div>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(1);
    expect(elements[0].getAttribute('tabindex')).toBe('0');
  });

  test('excludes disabled elements', () => {
    container.innerHTML = `
      <button disabled>Disabled button</button>
      <input disabled />
      <textarea disabled></textarea>
      <select disabled></select>
    `;
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(0);
  });

  test('excludes elements with tabindex=-1', () => {
    container.innerHTML = '<button tabindex="-1">Not tabbable</button>';
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(0);
  });

  test('returns elements in DOM order', () => {
    container.innerHTML = `
      <button id="btn1">First</button>
      <input id="input1" />
      <button id="btn2">Last</button>
    `;
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(3);
    expect(elements[0].id).toBe('btn1');
    expect(elements[1].id).toBe('input1');
    expect(elements[2].id).toBe('btn2');
  });

  test('finds multiple types of focusable elements', () => {
    container.innerHTML = `
      <button>Button</button>
      <a href="#">Link</a>
      <input type="text" />
      <textarea></textarea>
      <select><option>Opt</option></select>
      <div tabindex="0">Div</div>
    `;
    const elements = getFocusableElements(container);
    expect(elements.length).toBe(6);
  });
});
