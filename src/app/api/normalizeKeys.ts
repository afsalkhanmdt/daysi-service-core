export function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};
    for (const key in obj as object) {
        normalized[key.toLowerCase()] = obj[key];
    }
    return normalized;
}