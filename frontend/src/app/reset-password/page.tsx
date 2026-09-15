import PasswordRecovery from '@/components/PasswordRecovery';
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <PasswordRecovery token={token || null} />; }
