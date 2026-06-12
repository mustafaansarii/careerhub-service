import axios from 'axios';

const api = axios.create({
    baseURL: '/careerhub/api/',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

const TEMPLATES = 'admin/doc-templates'; 
const USER_DOCS = 'user-docs';

function listParams({ type, keyword, page = 0, size = 10 }) {
    const params = { page, size };
    if (type) params.type = type;
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    return params;
}

class DocService {
    async listTemplates(opts) {
        const res = await api.get(TEMPLATES, { params: listParams(opts) });
        return res.data;
    }

    async listUserDocs(opts) {
        const res = await api.get(USER_DOCS, { params: listParams(opts) });
        return res.data;
    }

    async getUserDoc(id) {
        const res = await api.get(`${USER_DOCS}/${id}`);
        return res.data;
    }

    async saveTemplateToAccount(templateId) {
        const res = await api.post(USER_DOCS, { templateId });
        return res.data;
    }

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
