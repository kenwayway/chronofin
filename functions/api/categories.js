// GET /api/categories - list all categories
// POST /api/categories - create a new category
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'GET') {
        try {
            const result = await env.DB.prepare(`
                SELECT * FROM categories ORDER BY type, parent_id NULLS FIRST, name
            `).all();

            return Response.json(result.results);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === 'POST') {
        try {
            const data = await request.json();
            const { name, type, color, icon, parent_id } = data;

            const result = await env.DB.prepare(`
                INSERT INTO categories (name, type, color, icon, parent_id)
                VALUES (?, ?, ?, ?, ?)
            `).bind(name, type, color, icon, parent_id || null).run();

            return Response.json({ id: result.meta.last_row_id, ...data }, { status: 201 });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
