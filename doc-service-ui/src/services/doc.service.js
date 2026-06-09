import axios from 'axios';

// All backend calls go through the Vite `/careerhub` proxy → backend root, so the cookie stays
// on the :5173 origin (the same origin OAuth redirects land on).
const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const TEMPLATES = 'admin/doc-templates'; // public GETs; POST is admin-only
const USER_DOCS = 'user-docs';

function listParams({ type, keyword, page = 0, size = 10 }) {
    const params = { page, size };
    if (type) params.type = type;
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    return params;
}

class DocService {
    /** Public: paginated template metadata (PageResponse). */
    async listTemplates(opts) {
        const res = await api.get(TEMPLATES, { params: listParams(opts) });
        return res.data;
    }

    /** Authenticated: the caller's saved docs (PageResponse of metadata). */
    async listUserDocs(opts) {
        const res = await api.get(USER_DOCS, { params: listParams(opts) });
        return res.data;
    }

    /** Authenticated: a single owned doc, including latexCode. */
    async getUserDoc(id) {
        const res = await api.get(`${USER_DOCS}/${id}`);
        return res.data;
    }

    /** Authenticated: copy a template into the caller's account → UserDocResponse. */
    async saveTemplateToAccount(templateId) {
        const res = await api.post(USER_DOCS, { templateId });
        return res.data;
    }

    /** Authenticated: persist new LaTeX, recompile, update stored PDF; returns the PDF as a Blob. */
    async compile(id, latexCode) {
        const res = await api.patch(
            `${USER_DOCS}/${id}/compile`,
            { latexCode },
            { responseType: 'blob' },
        );
        return res.data;
    }
}

export default new DocService();
