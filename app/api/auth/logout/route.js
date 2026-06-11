export async function POST() {
  const response = Response.json({ success: true, message: 'Logged out' });
  response.headers.set('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
  return response;
}

export async function GET() {
  return POST();
}
