export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'noite-df',
    timestamp: new Date().toISOString(),
  });
}
