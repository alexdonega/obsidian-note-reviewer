import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: mock(() => {}),
    onConfirm: mock(() => {}),
    title: 'Test Title',
    message: 'Test Message',
  };

  test('renderiza quando isOpen=true', () => {
    render(<ConfirmationDialog {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeDefined();
    expect(screen.getByText('Test Message')).toBeDefined();
    expect(screen.getByText('Confirmar')).toBeDefined();
    expect(screen.getByText('Cancelar')).toBeDefined();
  });

  test('nao renderiza quando isOpen=false', () => {
    render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Title')).toBeNull();
    expect(screen.queryByText('Test Message')).toBeNull();
  });

  test('chama onConfirm ao clicar no botao de confirmar', () => {
    const mockOnConfirm = mock(() => {});
    render(<ConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />);

    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('chama onClose ao clicar no botao de cancelar', () => {
    const mockOnClose = mock(() => {});
    render(<ConfirmationDialog {...defaultProps} onClose={mockOnClose} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('chama onClose ao clicar no backdrop', () => {
    const mockOnClose = mock(() => {});
    const { container } = render(<ConfirmationDialog {...defaultProps} onClose={mockOnClose} />);

    // The backdrop is the first div with the fixed class
    const backdrop = container.querySelector('.fixed');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('chama onClose ao pressionar Escape', () => {
    const mockOnClose = mock(() => {});
    render(<ConfirmationDialog {...defaultProps} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('chama onConfirm ao pressionar Enter', () => {
    const mockOnConfirm = mock(() => {});
    render(<ConfirmationDialog {...defaultProps} onConfirm={mockOnConfirm} />);

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('usa labels personalizados para botoes', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        confirmLabel="Excluir"
        cancelLabel="Voltar"
      />
    );

    expect(screen.getByText('Excluir')).toBeDefined();
    expect(screen.getByText('Voltar')).toBeDefined();
  });

  test('renderiza mensagem como ReactNode', () => {
    render(
      <ConfirmationDialog
        {...defaultProps}
        message={<span data-testid="custom-message">Custom JSX Message</span>}
      />
    );

    expect(screen.getByTestId('custom-message')).toBeDefined();
    expect(screen.getByText('Custom JSX Message')).toBeDefined();
  });

  test('nao propaga clique do card para o backdrop', () => {
    const mockOnClose = mock(() => {});
    const { container } = render(<ConfirmationDialog {...defaultProps} onClose={mockOnClose} />);

    // Click on the card (inner div with bg-card class)
    const card = container.querySelector('.bg-card');
    if (card) {
      fireEvent.click(card);
    }

    // onClose should NOT be called when clicking the card
    expect(mockOnClose).toHaveBeenCalledTimes(0);
  });
});
