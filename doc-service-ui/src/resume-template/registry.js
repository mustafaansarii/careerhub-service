import classic from './templates/classic';
import modern from './templates/modern';

/*
 * Template registry — every form-based resume design, keyed by its unique template code.
 * The same code is the join key to the backend LaTeX template (a card with that code opens this
 * design by default; "Edit with LaTeX editor" opens the matching LaTeX template instead).
 *
 * To add a design: create templates/<code>.jsx exporting a design object, import it here, and add
 * it to TEMPLATES. (Designs 2–4 to be added once their looks are specified.)
 */
const TEMPLATES = [classic, modern];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.code, t]));
export const TEMPLATE_LIST = TEMPLATES;
export const DEFAULT_CODE = 'classic';

export function getTemplate(code) {
    return TEMPLATE_MAP[code] || TEMPLATE_MAP[DEFAULT_CODE];
}
