import classic from './templates/classic';
import modern from './templates/modern';

const TEMPLATES = [classic, modern];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.code, t]));
export const TEMPLATE_LIST = TEMPLATES;
export const DEFAULT_CODE = 'classic';

export function getTemplate(code) {
    return TEMPLATE_MAP[code] || TEMPLATE_MAP[DEFAULT_CODE];
}
