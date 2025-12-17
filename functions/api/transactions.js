// GET /api/transactions - list all transactions
// POST /api/transactions - create a new transaction
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare(`
                SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
                       a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                ORDER BY t.date DESC
            `).all();

            return Response.json(result.results);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'POST') {
        try {
            const data = await request.json();
            const { type, amount, category_id, account_id, note, date } = data;

            const result = await env.DB.prepare(`
                INSERT INTO transactions (type, amount, category_id, account_id, note, date)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(type, amount, category_id, account_id, note || '', date).run();

            return Response.json({ id: result.meta.last_row_id, ...data }, { status: 201 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
