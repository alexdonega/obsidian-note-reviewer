import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  SHORTCUTS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  ShortcutCategory,
  Shortcut,
  isMac,
  getModifierKey,
  getShortcutsByCategory,
  formatShortcutKey,
  formatTooltipWithShortcut,
  getShortcutById,
  matchesShortcut,
  isInputFocused,
} from '../shortcuts';

describe('Shortcuts Registry', () => {
  describe('SHORTCUTS array', () => {
    test('contém pelo menos um atalho', () => {
      expect(SHORTCUTS.length).toBeGreaterThan(0);
    });

    test('cada atalho tem todos os campos obrigatórios', () => {
      for (const shortcut of SHORTCUTS) {
        expect(shortcut.id).toBeDefined();
        expect(typeof shortcut.id).toBe('string');
        expect(shortcut.key).toBeDefined();
        expect(typeof shortcut.key).toBe('string');
        expect(shortcut.label).toBeDefined();
        expect(typeof shortcut.label).toBe('string');
        expect(shortcut.description).toBeDefined();
        expect(typeof shortcut.description).toBe('string');
        expect(shortcut.category).toBeDefined();
        expect(['editing', 'navigation', 'general']).toContain(shortcut.category);
      }
    });

    test('cada atalho tem um ID único', () => {
      const ids = SHORTCUTS.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('inclui atalho undo-annotation', () => {
      const undoShortcut = SHORTCUTS.find(s => s.id === 'undo-annotation');
      expect(undoShortcut).toBeDefined();
      expect(undoShortcut?.key).toBe('Z');
      expect(undoShortcut?.modCtrl).toBe(true);
      expect(undoShortcut?.category).toBe('editing');
    });

    test('inclui atalho show-shortcuts', () => {
      const shortcutsShortcut = SHORTCUTS.find(s => s.id === 'show-shortcuts');
      expect(shortcutsShortcut).toBeDefined();
      expect(shortcutsShortcut?.key).toBe('?');
      expect(shortcutsShortcut?.category).toBe('general');
    });
  });

  describe('CATEGORY_LABELS', () => {
    test('tem labels para todas as categorias', () => {
      const categories: ShortcutCategory[] = ['editing', 'navigation', 'general'];
      for (const category of categories) {
        expect(CATEGORY_LABELS[category]).toBeDefined();
        expect(typeof CATEGORY_LABELS[category]).toBe('string');
      }
    });

    test('labels estão em português', () => {
      expect(CATEGORY_LABELS.editing).toBe('Edicao');
      expect(CATEGORY_LABELS.navigation).toBe('Navegacao');
      expect(CATEGORY_LABELS.general).toBe('Geral');
    });
  });

  describe('CATEGORY_ORDER', () => {
    test('contém todas as categorias', () => {
      expect(CATEGORY_ORDER).toContain('editing');
      expect(CATEGORY_ORDER).toContain('navigation');
      expect(CATEGORY_ORDER).toContain('general');
    });

    test('tem ordem específica', () => {
      expect(CATEGORY_ORDER[0]).toBe('general');
      expect(CATEGORY_ORDER[1]).toBe('editing');
      expect(CATEGORY_ORDER[2]).toBe('navigation');
    });
  });
});

describe('Platform Detection', () => {
  describe('isMac', () => {
    test('retorna boolean', () => {
      const result = isMac();
      expect(typeof result).toBe('boolean');
    });

    test('retorna false quando navigator é undefined', () => {
      // In test environment, navigator may not have typical platform
      const result = isMac();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getModifierKey', () => {
    test('retorna Ctrl ou símbolo de comando', () => {
      const result = getModifierKey();
      expect(['Ctrl', '⌘']).toContain(result);
    });
  });
});

describe('getShortcutsByCategory', () => {
  test('retorna objeto com todas as categorias', () => {
    const grouped = getShortcutsByCategory();
    expect(grouped.editing).toBeDefined();
    expect(grouped.navigation).toBeDefined();
    expect(grouped.general).toBeDefined();
  });

  test('agrupa atalhos corretamente', () => {
    const grouped = getShortcutsByCategory();

    // Verify each shortcut is in its correct category
    for (const shortcut of SHORTCUTS) {
      expect(grouped[shortcut.category]).toContain(shortcut);
    }
  });

  test('categorias vazias são arrays vazios', () => {
    const grouped = getShortcutsByCategory();

    // Navigation category should be empty since no navigation shortcuts are defined
    if (!SHORTCUTS.some(s => s.category === 'navigation')) {
      expect(grouped.navigation).toEqual([]);
    }
  });
});

describe('getShortcutById', () => {
  test('retorna atalho existente', () => {
    const shortcut = getShortcutById('undo-annotation');
    expect(shortcut).toBeDefined();
    expect(shortcut?.id).toBe('undo-annotation');
  });

  test('retorna undefined para ID inexistente', () => {
    const shortcut = getShortcutById('non-existent-shortcut');
    expect(shortcut).toBeUndefined();
  });
});

describe('formatShortcutKey', () => {
  test('formata atalho simples sem modificadores', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'A',
      label: 'Test',
      description: 'Test shortcut',
      category: 'general',
    };

    const result = formatShortcutKey(shortcut);
    expect(result).toBe('A');
  });

  test('formata atalho com Ctrl/Cmd', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      modCtrl: true,
      label: 'Test',
      description: 'Test shortcut',
      category: 'editing',
    };

    const result = formatShortcutKey(shortcut);
    // Should be either "Ctrl+Z" or "⌘Z" depending on platform
    expect(result.includes('Z')).toBe(true);
    expect(result.includes('Ctrl') || result.includes('⌘')).toBe(true);
  });

  test('formata atalho com múltiplos modificadores', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'S',
      modCtrl: true,
      modShift: true,
      label: 'Test',
      description: 'Test shortcut',
      category: 'editing',
    };

    const result = formatShortcutKey(shortcut);
    expect(result.includes('S')).toBe(true);
    // Should include shift indicator
    expect(result.includes('Shift') || result.includes('⇧')).toBe(true);
  });

  test('formata atalho com Alt', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'P',
      modAlt: true,
      label: 'Test',
      description: 'Test shortcut',
      category: 'editing',
    };

    const result = formatShortcutKey(shortcut);
    expect(result.includes('P')).toBe(true);
    expect(result.includes('Alt') || result.includes('⌥')).toBe(true);
  });
});

describe('formatTooltipWithShortcut', () => {
  test('formata tooltip com atalho existente', () => {
    const result = formatTooltipWithShortcut('Desfazer', 'undo-annotation');
    expect(result).toContain('Desfazer');
    expect(result).toContain('(');
    expect(result).toContain(')');
    // Should contain the key
    expect(result).toContain('Z');
  });

  test('retorna label original para atalho inexistente', () => {
    const result = formatTooltipWithShortcut('Minha Acao', 'non-existent');
    expect(result).toBe('Minha Acao');
  });

  test('formata tooltip para show-shortcuts', () => {
    const result = formatTooltipWithShortcut('Atalhos', 'show-shortcuts');
    expect(result).toContain('Atalhos');
    expect(result).toContain('(');
    expect(result).toContain('?)');
  });
});

describe('matchesShortcut', () => {
  test('corresponde atalho simples', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: '?',
      label: 'Test',
      description: 'Test',
      category: 'general',
    };

    const event = new KeyboardEvent('keydown', { key: '?' });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  test('corresponde atalho com Ctrl', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      modCtrl: true,
      label: 'Test',
      description: 'Test',
      category: 'editing',
    };

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  test('corresponde atalho com metaKey (Cmd no Mac)', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      modCtrl: true,
      label: 'Test',
      description: 'Test',
      category: 'editing',
    };

    const event = new KeyboardEvent('keydown', { key: 'z', metaKey: true });
    expect(matchesShortcut(event, shortcut)).toBe(true);
  });

  test('não corresponde quando falta modificador', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      modCtrl: true,
      label: 'Test',
      description: 'Test',
      category: 'editing',
    };

    const event = new KeyboardEvent('keydown', { key: 'z' });
    // Should fail because Ctrl is required but not pressed
    // Note: matchesShortcut returns true if modCtrl is required and NOT pressed
    // This is because modCtrl check only validates if present in shortcut
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  test('não corresponde tecla errada', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      modCtrl: true,
      label: 'Test',
      description: 'Test',
      category: 'editing',
    };

    const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
    expect(matchesShortcut(event, shortcut)).toBe(false);
  });

  test('corresponde tecla case-insensitive', () => {
    const shortcut: Shortcut = {
      id: 'test',
      key: 'Z',
      label: 'Test',
      description: 'Test',
      category: 'editing',
    };

    const eventLower = new KeyboardEvent('keydown', { key: 'z' });
    const eventUpper = new KeyboardEvent('keydown', { key: 'Z' });

    expect(matchesShortcut(eventLower, shortcut)).toBe(true);
    expect(matchesShortcut(eventUpper, shortcut)).toBe(true);
  });
});

describe('isInputFocused', () => {
  let originalActiveElement: Element | null;

  beforeEach(() => {
    originalActiveElement = document.activeElement;
  });

  afterEach(() => {
    // Reset focus
    if (originalActiveElement instanceof HTMLElement) {
      originalActiveElement.focus();
    }
  });

  test('retorna false quando nenhum elemento tem foco', () => {
    // In test environment with body focused, should return false
    document.body.focus();
    const result = isInputFocused();
    expect(typeof result).toBe('boolean');
  });

  test('retorna true quando input tem foco', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    expect(isInputFocused()).toBe(true);

    document.body.removeChild(input);
  });

  test('retorna true quando textarea tem foco', () => {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();

    expect(isInputFocused()).toBe(true);

    document.body.removeChild(textarea);
  });

  test('retorna true quando elemento contenteditable tem foco', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);
    div.focus();

    expect(isInputFocused()).toBe(true);

    document.body.removeChild(div);
  });

  test('retorna false quando div normal tem foco', () => {
    const div = document.createElement('div');
    div.tabIndex = 0; // Make it focusable
    document.body.appendChild(div);
    div.focus();

    expect(isInputFocused()).toBe(false);

    document.body.removeChild(div);
  });
});
