// GET/PUT/DELETE /api/accounts/[id]
export async function onRequest(context) {
    const { request, env, params } = context;
    const id = params.id;

    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare(`
                SELECT a.*,
                    a.initial_balance + COALESCE(
                        (SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
                         FROM transactions t WHERE t.account_id = a.id), 0
                    ) as balance
                FROM accounts a WHERE a.id = ?
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
            const { name, type, color, icon, initial_balance } = data;

            await env.DB.prepare(`
                UPDATE accounts 
                SET name = ?, type = ?, color = ?, icon = ?, initial_balance = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(name, type, color, icon, initial_balance || 0, id).run();

            return Response.json({ id: parseInt(id), ...data });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'DELETE') {
        try {
            // Check for transactions
            const txs = await env.DB.prepare('SELECT id FROM transactions WHERE account_id = ?').bind(id).all();
            if (txs.results.length > 0) {
                return Response.json({ error: 'Cannot delete account with transactions' }, { status: 400 });
            }

            await env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run();
            return new Response(null, { status: 204 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
