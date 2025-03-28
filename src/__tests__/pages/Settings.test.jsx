import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../../pages/Settings';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

describe('Settings Component', () => {
  // Mock user data
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  };

  // Mock updateProfile function
  const mockUpdateProfile = jest.fn();

  // Setup default mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default implementation for useAuth
    useAuth.mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
    });

    // Default implementation for supabase.auth.updateUser
    supabase.auth.updateUser.mockResolvedValue({ error: null });
    
    // Mock updateProfile to resolve successfully by default
    mockUpdateProfile.mockResolvedValue({ error: null });
  });

  // Test 1: Render settings form correctly
  test('renders settings form with user data', () => {
    render(<Settings />);
    
    // Check if form elements are rendered with correct user data
    expect(screen.getByLabelText(/name/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/^new password$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^confirm new password$/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  // Test 2: Update profile successfully
  test('updates profile successfully when form is submitted', async () => {
    const user = userEvent.setup();
    render(<Settings />);
    
    // Update name field
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Check if updateProfile was called with correct data
    expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'Updated Name' });
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  // Test 3: Show loading state during submission
  test('shows loading state during form submission', async () => {
    // Make updateProfile take some time to resolve
    mockUpdateProfile.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ error: null }), 100);
    }));
    
    const user = userEvent.setup();
    render(<Settings />);
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Check if loading state is shown
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  // Test 4: Clear password fields after update
  test('clears password fields after successful update', async () => {
    const user = userEvent.setup();
    render(<Settings />);
    
    // Fill in password fields
    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm new password$/i);
    
    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Check if password fields are cleared after successful update
    await waitFor(() => {
      expect(passwordInput).toHaveValue('');
      expect(confirmPasswordInput).toHaveValue('');
    });
  });
});