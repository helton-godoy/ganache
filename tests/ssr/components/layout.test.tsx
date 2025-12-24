import RootLayout from '@/app/layout';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mocks
vi.mock('@/components/ui/sonner', () => ({
    Toaster: () => <div data-testid="toaster" />,
}));
vi.mock('next/font/google', () => ({
    Geist: () => ({ variable: 'font-geist-sans' }),
    Geist_Mono: () => ({ variable: 'font-geist-mono' }),
}));

describe('RootLayout', () => {
    it('renders children correctly', () => {
        render(
            <RootLayout>
                <div data-testid="test-child">Test Content</div>
            </RootLayout>
        );
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        // Since Toaster is inside QueryClientProvider (which we should also check or allow real one if simple)
        // QueryClientProvider renders children, so it should be fine.
    });

    it('renders Toaster', () => {
        render(
            <RootLayout>
                <div>child</div>
            </RootLayout>
        );
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
});
