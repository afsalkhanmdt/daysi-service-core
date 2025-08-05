export function normalizeKeys(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map((item) => normalizeKeys(item));
    }

    if (obj !== null && typeof obj === 'object') {
        const normalized: Record<string, unknown> = {};
        for (const key in obj as Record<string, unknown>) {
            const loweredKey = key.toLowerCase();
            normalized[loweredKey] = normalizeKeys((obj as Record<string, unknown>)[key]);
        }
        return normalized;
    }

    return obj;
}
