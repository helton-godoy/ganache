import Home from '@/app/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mocks
vi.mock('@/components/features/BootEnvironmentBadge', () => ({
    BootEnvironmentBadge: () => <div data-testid="boot-badge">Badge</div>,
}));
vi.mock('@/components/features/dashboard/status-dashboard', () => ({
    StatusDashboard: () => <div data-testid="status-dashboard">Dashboard</div>,
}));

describe('Home Dashboard', () => {
    it('renders key elements', () => {
        render(<Home />);

        expect(screen.getByText('Ganache Dashboard')).toBeInTheDocument();
        expect(screen.getByText('System Monitoring & Control')).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
        render(<Home />);
        expect(screen.getByRole('link', { name: /Setup Journey/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Cluster Management/i })).toBeInTheDocument();
    });

    it('contains StatusDashboard', () => {
        render(<Home />);
        expect(screen.getByTestId('status-dashboard')).toBeInTheDocument();
    });
});
