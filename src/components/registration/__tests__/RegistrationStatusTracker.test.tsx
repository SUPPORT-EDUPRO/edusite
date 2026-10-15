import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RegistrationStatusTracker } from '../RegistrationStatusTracker';
import { SubmittedConfirmation } from '../YoungEagles2027Review';

describe('registration follow-up experience', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the saved reference and clear next actions after submission', () => {
    render(
      <SubmittedConfirmation
        registration={{
          id: 'registration-1',
          paymentReference: 'REG-2027-1792000000000-ABCDE',
          registrationFeeAmount: 400,
          discountAmount: 0,
          campaignCode: null,
          guardianEmail: 'parent@example.com',
          guardianName: 'Parent Name',
          childName: 'Olivia Martin',
        }}
      />,
    );

    expect(screen.getByText('REG-2027-1792000000000-ABCDE')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Upload proof of payment' })).toHaveAttribute(
      'href',
      '/upload-payment?ref=REG-2027-1792000000000-ABCDE',
    );
    expect(screen.getByRole('link', { name: 'Track application' })).toHaveAttribute(
      'href',
      '/registration/status?ref=REG-2027-1792000000000-ABCDE',
    );
  });

  it('looks up an application without placing the parent email in the URL', async () => {
    const user = userEvent.setup();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          application: {
            childFirstName: 'Olivia',
            status: 'pending',
            submittedAt: '2026-10-15T05:00:00Z',
            registrationFeeAmount: 400,
            registrationFeePaid: false,
            registrationFeeWaived: false,
            paymentVerified: false,
            documentsUploaded: false,
            rejectionReason: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<RegistrationStatusTracker initialReference="REG-2027-1792000000000-ABCDE" />);
    await user.type(screen.getByLabelText('Parent or guardian email'), 'parent@example.com');
    await user.click(screen.getByRole('button', { name: 'Check application' }));

    await waitFor(() => expect(screen.getByText('Application under review')).toBeVisible());
    expect(screen.getByRole('link', { name: 'Upload proof of payment' })).toHaveAttribute(
      'href',
      '/upload-payment?ref=REG-2027-1792000000000-ABCDE',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/registrations/status',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          reference: 'REG-2027-1792000000000-ABCDE',
          email: 'parent@example.com',
        }),
      }),
    );
  });
});
