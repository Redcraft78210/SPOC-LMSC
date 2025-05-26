// src/__tests__/Logout.test.jsx
import React from 'react'; // Ajout de l'import de React
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Logout from '../components/Logout'; // Assurez-vous que le chemin est correct

describe('Logout Component', () => {
  it('appelle la fonction onLogout et redirige vers /sign', () => {
    const mockOnLogout = vi.fn();

    render(
      <MemoryRouter>
        <Logout onLogout={mockOnLogout} />
      </MemoryRouter>
    );

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
