export async function GET() {
  return new Response(JSON.stringify({ pong: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
