import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';

describe('Settings', () => {
  test('abre modal ao clicar no botão', () => {
    render(<Settings />);

    const button = screen.getByRole('button', { name: /abrir configurações/i });
    fireEvent.click(button);

    expect(screen.getByText('Configurações de Tipos de Nota')).toBeDefined();
  });

  test('regenera identidade', async () => {
    const mockOnIdentityChange = mock((oldId: string, newId: string) => {});

    render(<Settings onIdentityChange={mockOnIdentityChange} />);

    // Open settings
    fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

    // Navigate to a tab that shows the identity section
    const atomicaTab = screen.getByRole('tab', { name: /notas atômicas/i });
    fireEvent.click(atomicaTab);

    // Find and click the regenerate identity button
    const regenButton = screen.getByRole('button', { name: /gerar nova identidade/i });
    fireEvent.click(regenButton);

    await waitFor(() => {
      expect(mockOnIdentityChange).toHaveBeenCalled();
    });
  });

  // Accessibility tests for ARIA labels
  describe('Acessibilidade', () => {
    test('botão de abrir configurações tem aria-label descritivo', () => {
      render(<Settings />);

      const button = screen.getByRole('button', { name: /abrir configurações/i });
      expect(button).toBeDefined();
      expect(button.getAttribute('aria-label')).toBe('Abrir configurações');
    });

    test('modal usa role tablist para navegação de abas', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeDefined();
      expect(tablist.getAttribute('aria-label')).toBe('Categorias de tipos de nota');
    });

    test('abas têm role tab e aria-selected', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);

      // First tab (regras) should be selected by default
      const regrasTab = tabs.find(tab => tab.textContent?.includes('Regras'));
      expect(regrasTab?.getAttribute('aria-selected')).toBe('true');

      // Other tabs should not be selected
      const atomicaTab = tabs.find(tab => tab.textContent?.includes('Atômicas'));
      expect(atomicaTab?.getAttribute('aria-selected')).toBe('false');
    });

    test('abas têm aria-controls apontando para o painel', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const regrasTab = screen.getByRole('tab', { name: /regras/i });
      expect(regrasTab.getAttribute('aria-controls')).toBe('settings-panel-regras');
      expect(regrasTab.getAttribute('id')).toBe('settings-tab-regras');
    });

    test('painel de conteúdo tem role tabpanel e aria-labelledby', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeDefined();
      expect(tabpanel.getAttribute('aria-labelledby')).toBe('settings-tab-regras');
    });

    test('botão de carregar padrões tem aria-label descritivo', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const loadDefaultsButton = screen.getByRole('button', { name: /carregar valores padrão/i });
      expect(loadDefaultsButton).toBeDefined();
      expect(loadDefaultsButton.getAttribute('aria-label')).toBe('Carregar valores padrão');
    });

    test('botão de fechar no header tem aria-label descritivo', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      // The close button in header has aria-label "Fechar"
      const closeButton = screen.getByRole('button', { name: 'Fechar' });
      expect(closeButton).toBeDefined();
    });

    test('botão de fechar no footer tem aria-label descritivo', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      // The close button in footer has aria-label "Fechar configurações"
      const closeFooterButton = screen.getByRole('button', { name: /fechar configurações/i });
      expect(closeFooterButton).toBeDefined();
      expect(closeFooterButton.getAttribute('aria-label')).toBe('Fechar configurações');
    });

    test('aria-selected muda ao clicar em outra aba', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      const regrasTab = screen.getByRole('tab', { name: /regras/i });
      const atomicaTab = screen.getByRole('tab', { name: /atômicas/i });

      // Initially regras is selected
      expect(regrasTab.getAttribute('aria-selected')).toBe('true');
      expect(atomicaTab.getAttribute('aria-selected')).toBe('false');

      // Click atomica tab
      fireEvent.click(atomicaTab);

      // Now atomica should be selected
      expect(regrasTab.getAttribute('aria-selected')).toBe('false');
      expect(atomicaTab.getAttribute('aria-selected')).toBe('true');
    });

    test('botão de regenerar identidade tem aria-label descritivo', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      // Navigate to a tab that shows identity section
      const atomicaTab = screen.getByRole('tab', { name: /atômicas/i });
      fireEvent.click(atomicaTab);

      const regenButton = screen.getByRole('button', { name: /gerar nova identidade/i });
      expect(regenButton).toBeDefined();
      expect(regenButton.getAttribute('aria-label')).toBe('Gerar nova identidade de revisor');
    });

    test('tabpanel muda id e aria-labelledby ao trocar aba', () => {
      render(<Settings />);

      fireEvent.click(screen.getByRole('button', { name: /abrir configurações/i }));

      let tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel.getAttribute('id')).toBe('settings-panel-regras');
      expect(tabpanel.getAttribute('aria-labelledby')).toBe('settings-tab-regras');

      // Click atomica tab
      const atomicaTab = screen.getByRole('tab', { name: /atômicas/i });
      fireEvent.click(atomicaTab);

      tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel.getAttribute('id')).toBe('settings-panel-atomica');
      expect(tabpanel.getAttribute('aria-labelledby')).toBe('settings-tab-atomica');
    });
  });
});
