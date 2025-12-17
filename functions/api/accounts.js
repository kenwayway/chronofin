// GET /api/accounts - list all accounts with calculated balances
// POST /api/accounts - create a new account
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'GET') {
        try {
            // Get accounts with calculated balances
            const result = await env.DB.prepare(`
                SELECT a.*,
                    a.initial_balance + COALESCE(
                        (SELECT SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)
                         FROM transactions t WHERE t.account_id = a.id), 0
                    ) as balance
                FROM accounts a
                ORDER BY a.name
            `).all();

            return Response.json(result.results);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'POST') {
        try {
            const data = await request.json();
            const { name, type, color, icon, initial_balance } = data;

            const result = await env.DB.prepare(`
                INSERT INTO accounts (name, type, color, icon, initial_balance)
                VALUES (?, ?, ?, ?, ?)
            `).bind(name, type, color, icon, initial_balance || 0).run();

            return Response.json({
                id: result.meta.last_row_id,
                ...data,
                balance: initial_balance || 0
            }, { status: 201 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
