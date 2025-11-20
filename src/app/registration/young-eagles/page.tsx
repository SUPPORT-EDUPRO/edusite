import { PublicRegistrationForm } from '@/components/registration/PublicRegistrationForm';

// Young Eagles specific registration page
export default function YoungEaglesRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <PublicRegistrationForm
        organizationId="6b92f8a5-48e7-4865-b85f-4b92c174e0ef"
        schoolCode="YE-2026"
        schoolName="Young Eagles Preschool"
        slug="young-eagles"
        initialBranding={{
          id: "6b92f8a5-48e7-4865-b85f-4b92c174e0ef",
          name: "Young Eagles Preschool",
          slug: "young-eagles",
          organization_type: "preschool",
          logo_url: "/app-icons/yehc_logo.png",
          primary_color: "#3B82F6",
          secondary_color: "#8B5CF6", 
          registration_open: true,
          registration_message: "Welcome to Young Eagles Preschool! We are now accepting registrations for the 2026 academic year. Join our nurturing environment where young minds take flight!",
          min_age: 2,
          max_age: 6
        }}
      />
    </div>
  );
}