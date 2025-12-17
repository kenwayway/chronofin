// GET/PUT/DELETE /api/categories/[id]
export async function onRequest(context) {
    const { request, env, params } = context;
    const id = params.id;

    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
            if (!result) {
                return Response.json({ error: 'Not found' }, { status: 404 });
            }
            return Response.json(result);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'PUT') {
        try {
            const data = await request.json();
            const { name, color, icon } = data;

            await env.DB.prepare(`
                UPDATE categories SET name = ?, color = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            `).bind(name, color, icon, id).run();

            return Response.json({ id: parseInt(id), ...data });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'DELETE') {
        try {
            // Check for subcategories
            const subs = await env.DB.prepare('SELECT id FROM categories WHERE parent_id = ?').bind(id).all();
            if (subs.results.length > 0) {
                return Response.json({ error: 'Cannot delete category with subcategories' }, { status: 400 });
            }

            // Check for transactions
            const txs = await env.DB.prepare('SELECT id FROM transactions WHERE category_id = ?').bind(id).all();
            if (txs.results.length > 0) {
                return Response.json({ error: 'Cannot delete category with transactions' }, { status: 400 });
            }

            await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
