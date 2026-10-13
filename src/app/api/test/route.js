import { wc } from '@/lib/woocommerce';

export async function GET() {
  try {
    const { data } = await wc.get('products', { per_page: 5 });
    return Response.json({ ok: true, count: data.length, names: data.map((p) => p.name) });
  } catch (e) {
    return Response.json(
      { ok: false, status: e.response?.status, error: e.response?.data || e.message },
      { status: 500 }
    );
  }
}
