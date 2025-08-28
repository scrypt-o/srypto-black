import AuthLayout from '@/components/layouts/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Log in or sign up to continue"
    >
      <LoginForm />
    </AuthLayout>
  )
}