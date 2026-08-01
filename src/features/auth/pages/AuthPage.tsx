import { AuthLayout } from '../layouts';
import { AuthTabs, type AuthView } from '../components';

interface AuthPageProps {
  initialView?: AuthView;
}

export const AuthPage = ({ initialView = 'login' }: AuthPageProps) => {
  return (
    <AuthLayout>
      <AuthTabs initialView={initialView} />
    </AuthLayout>
  );
};
