import fs from 'node:fs';
import path from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT,
  YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE,
  YOUNG_EAGLES_2027_TERMS_LINK_ACCESSIBLE_NAME,
  YOUNG_EAGLES_TERMS_PATH,
} from '@/lib/young-eagles-registration';

import { YoungEagles2027RegistrationPreview } from '../YoungEagles2027RegistrationPreview';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    alt?: string;
    className?: string;
    height?: number;
    src?: string;
    width?: number;
  }) => <img alt={props.alt ?? ''} {...props} />,
}));

async function continueToDocuments(user: ReturnType<typeof userEvent.setup>) {
  render(<YoungEagles2027RegistrationPreview />);

  await user.type(screen.getByLabelText('Guardian legal name (required)'), 'Naledi Mokoena');
  await user.type(screen.getByLabelText('Email address (required)'), 'naledi@example.com');
  await user.type(screen.getByLabelText('Mobile number (required)'), '+27 72 000 0000');
  await user.selectOptions(screen.getByLabelText('Relationship to child (required)'), 'Parent');
  await user.click(screen.getByRole('button', { name: 'Continue to Child details' }));

  await user.type(screen.getByLabelText('Child legal name (required)'), 'Amahle Mokoena');
  await user.type(screen.getByLabelText('Date of birth (required)'), '2020-04-12');
  await user.selectOptions(
    screen.getByLabelText('Intended start (required)'),
    'Start of the 2027 school year',
  );
  await user.click(screen.getByRole('button', { name: 'Continue to Documents & consent' }));
}

describe('YoungEagles2027RegistrationPreview', () => {
  it('treats the current 2026 terms document as the 2027 agreement without rewriting it', async () => {
    const user = userEvent.setup();

    await continueToDocuments(user);

    expect(screen.getByRole('heading', { name: 'Documents & consent' })).toBeVisible();

    const termsCheckbox = screen.getByLabelText(YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT);
    const termsLink = screen.getByRole('link', {
      name: YOUNG_EAGLES_2027_TERMS_LINK_ACCESSIBLE_NAME,
    });
    expect(termsLink).toHaveAttribute('href', YOUNG_EAGLES_TERMS_PATH);
    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(termsLink).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(termsLink).toBeVisible();

    const acknowledgementContainer = termsCheckbox.closest('div');
    const termsCarryoverNote = screen.getByText(YOUNG_EAGLES_2027_TERMS_CARRYOVER_NOTE, {
      exact: true,
    });
    expect(acknowledgementContainer).toContainElement(termsCheckbox);
    expect(acknowledgementContainer).toContainElement(termsLink);
    expect(acknowledgementContainer).toContainElement(termsCarryoverNote);
    expect(screen.queryByText(/reference only/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/versioned 2027/i)).not.toBeInTheDocument();

    expect(termsCheckbox).not.toBeChecked();
    await user.click(termsLink);
    expect(termsCheckbox).not.toBeChecked();

    await user.click(screen.getByText(YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT, { exact: true }));
    expect(termsCheckbox).toBeChecked();

    await user.click(screen.getByRole('button', { name: /Family details/ }));
    expect(screen.getByLabelText('Guardian legal name (required)')).toHaveValue('Naledi Mokoena');
    expect(screen.getByLabelText('Email address (required)')).toHaveValue('naledi@example.com');
    expect(screen.getByLabelText('Mobile number (required)')).toHaveValue('+27 72 000 0000');

    await user.click(screen.getByRole('button', { name: 'Continue to Child details' }));
    expect(screen.getByLabelText('Child legal name (required)')).toHaveValue('Amahle Mokoena');
  });

  it('serves the 2027 registration route instead of redirecting to 2026', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/registration/young-eagles-2027/page.tsx'),
      'utf8',
    );

    expect(source).not.toMatch(/\bredirect\s*\(/);
    expect(source).toContain('YoungEagles2027RegistrationPreview');
  });

  it('lets a family give media permission and upload the three documents on the consent step', async () => {
    const user = userEvent.setup();

    await continueToDocuments(user);

    expect(
      screen.getByLabelText(
        'Yes — I give permission for photographs and videos of my child for school activities and promotional materials',
      ),
    ).toBeVisible();
    expect(screen.getByLabelText('No media permission for now')).toBeVisible();
    expect(screen.getByLabelText('Ask me later about media permission')).toBeVisible();
    expect(screen.queryByLabelText('Child birth certificate (required)')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Upload the required documents now'));
    expect(screen.getByLabelText('Child birth certificate (required)')).toBeVisible();
    expect(
      screen.getByLabelText('Child clinic card (Road to Health card) (required)'),
    ).toBeVisible();
    expect(screen.getByLabelText('Parent or guardian ID document (required)')).toBeVisible();

    await user.click(
      screen.getByLabelText(
        'Required application-contact acknowledgement: I am authorised to enquire about registration and agree to be contacted about this application.',
      ),
    );
    await user.click(
      screen.getByLabelText(
        'Required privacy acknowledgement: I understand that the published privacy information will apply to this application.',
      ),
    );
    await user.click(screen.getByText(YOUNG_EAGLES_2027_TERMS_ACKNOWLEDGEMENT, { exact: true }));
    await user.click(
      screen.getByLabelText(
        'Yes — I give permission for photographs and videos of my child for school activities and promotional materials',
      ),
    );
    await user.click(screen.getByRole('button', { name: 'Continue to Review & submit' }));
    expect(
      screen.getByText(
        'Select the three required documents to upload now, or choose to upload later in the app.',
      ),
    ).toBeVisible();

    await user.upload(
      screen.getByLabelText('Child birth certificate (required)'),
      new File(['birth'], 'amahle-birth.pdf', { type: 'application/pdf' }),
    );
    await user.upload(
      screen.getByLabelText('Child clinic card (Road to Health card) (required)'),
      new File(['clinic'], 'amahle-clinic.jpg', { type: 'image/jpeg' }),
    );
    await user.upload(
      screen.getByLabelText('Parent or guardian ID document (required)'),
      new File(['id'], 'naledi-id.png', { type: 'image/png' }),
    );

    await user.click(screen.getByRole('button', { name: 'Continue to Review & submit' }));
    expect(screen.getByRole('heading', { name: 'Review your application' })).toBeVisible();
    expect(screen.getByText(/amahle-birth.pdf/)).toBeVisible();
    expect(screen.getByText(/Permission given for school photographs and videos/)).toBeVisible();
  });
});
