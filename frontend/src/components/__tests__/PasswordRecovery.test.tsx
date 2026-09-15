import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PasswordRecovery from '../PasswordRecovery';
import api from '@/lib/api';
jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }));
beforeEach(() => jest.clearAllMocks());
test('submits a reset request and announces generic success', async () => {
 (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
 render(<PasswordRecovery />);
 fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'student@example.com' } });
 fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
 await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'student@example.com' }));
 expect(await screen.findByRole('status')).toHaveTextContent('If an account exists');
});
test('missing reset token displays an actionable error', () => {
 render(<PasswordRecovery token={null} />);
 expect(screen.getByRole('alert')).toHaveTextContent('missing its token');
 expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
test('server failure is visible and retry stays available', async () => {
 (api.post as jest.Mock).mockRejectedValue({ response: { data: { error: { message: 'Expired reset link' } } } });
 render(<PasswordRecovery token="token" />);
 fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'Password123' } });
 fireEvent.click(screen.getByRole('button', { name: 'Update password' }));
 expect(await screen.findByRole('alert')).toHaveTextContent('Expired reset link');
 expect(screen.getByRole('button')).toBeEnabled();
});
