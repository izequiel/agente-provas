import { signIn } from 'next-auth/react';

export default function Login() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await signIn('credentials', {
      username: form.get('username'),
      password: form.get('password'),
      callbackUrl: '/',
    });
  };

  return (
    <main>
  <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
    <h1>🔐 Login</h1>
    <form onSubmit={handleLogin}>
      <input name="username" type="text" placeholder="Usuário" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
    </form>
  </div>
</main>

  );
}