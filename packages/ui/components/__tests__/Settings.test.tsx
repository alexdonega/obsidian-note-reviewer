import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';

describe('Settings', () => {
  test('abre modal ao clicar no botão', () => {
    render(<Settings />);

    const button = screen.getByTitle(/Configurações/);
    fireEvent.click(button);

    expect(screen.getByText('Configurações')).toBeDefined();
    expect(screen.getByText('Sua Identidade')).toBeDefined();
  });

  test('permite editar caminho do vault', async () => {
    const mockOnVaultPathChange = mock((path: string) => {});

    render(<Settings onVaultPathChange={mockOnVaultPathChange} />);

    fireEvent.click(screen.getByTitle(/Configurações/));

    const input = screen.getByPlaceholderText(/ObsidianVault/);
    fireEvent.change(input, { target: { value: 'C:/Test/Vault' } });

    await waitFor(() => {
      expect(mockOnVaultPathChange).toHaveBeenCalledWith('C:/Test/Vault');
    });
  });

  test('regenera identidade', async () => {
    const mockOnIdentityChange = mock((oldId: string, newId: string) => {});

    render(<Settings onIdentityChange={mockOnIdentityChange} />);

    fireEvent.click(screen.getByTitle(/Configurações/));

    const regenButton = screen.getByTitle('Regenerar identidade');
    fireEvent.click(regenButton);

    await waitFor(() => {
      expect(mockOnIdentityChange).toHaveBeenCalled();
    });
  });
});
