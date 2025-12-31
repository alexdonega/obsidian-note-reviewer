import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DecisionBar } from '../DecisionBar';

describe('DecisionBar', () => {
  test('renderiza botões de aprovar e negar', () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={3}
        getFeedback={mockGetFeedback}
      />
    );

    expect(screen.getByText('Aprovar Nota')).toBeDefined();
    expect(screen.getByText('Solicitar Alterações')).toBeDefined();
    expect(screen.getByText(/3.*anotações/)).toBeDefined();
  });

  test('chama onApprove ao clicar em aprovar', async () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledTimes(1);
    });
  });

  test('mostra estado de submissão', async () => {
    const mockApprove = mock(() => new Promise(resolve => setTimeout(resolve, 100)));
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    expect(screen.getByText('Aprovando...')).toBeDefined();
  });

  test('mostra tela de sucesso após aprovação', async () => {
    const mockApprove = mock(() => Promise.resolve());
    const mockDeny = mock(() => Promise.resolve());
    const mockGetFeedback = mock(() => 'feedback');

    render(
      <DecisionBar
        onApprove={mockApprove}
        onDeny={mockDeny}
        annotationCount={0}
        getFeedback={mockGetFeedback}
      />
    );

    const approveButton = screen.getByText('Aprovar Nota');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText('Nota Aprovada')).toBeDefined();
      expect(screen.getByText(/será salva no Obsidian/)).toBeDefined();
    });
  });
});
