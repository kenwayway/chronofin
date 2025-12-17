// GET/PUT/DELETE /api/transactions/[id]
export async function onRequest(context) {
    const { request, env, params } = context;
    const id = params.id;

    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare(`
                SELECT t.*, c.name as category_name, c.color as category_color,
                       a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.id = ?
            `).bind(id).first();

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
            const { type, amount, category_id, account_id, note, date } = data;

            await env.DB.prepare(`
                UPDATE transactions 
                SET type = ?, amount = ?, category_id = ?, account_id = ?, note = ?, date = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(type, amount, category_id, account_id, note || '', date, id).run();

            return Response.json({ id: parseInt(id), ...data });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'DELETE') {
        try {
            await env.DB.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run();
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
