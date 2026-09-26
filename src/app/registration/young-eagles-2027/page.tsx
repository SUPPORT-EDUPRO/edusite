import type { Metadata } from 'next';

import { YoungEaglesLiveRegistrationForm } from '@/components/registration/YoungEaglesLiveRegistrationForm';

export const metadata: Metadata = {
  title: 'Young Eagles 2027 registration | EduSitePro',
  description: 'Register your child for the 2027 academic year at Young Eagles Preschool.',
};

export default function YoungEagles2027RegistrationPage() {
  return <YoungEaglesLiveRegistrationForm />;
}
