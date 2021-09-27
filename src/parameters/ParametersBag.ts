export class ParametersBag {
  private parametersMap: Map<string, unknown>;
  constructor(initialMap?: Map<string, unknown>) {
    this.parametersMap = initialMap ?? new Map();
  }

  add(value?: unknown, with$ = false, alias?: string): string {
    let paramCount = 1;
    const _alias = alias?.replace(/\W/g, '_') ?? 'param';
    let key = _alias;
    while (this.parametersMap.has(key)) {
      key = `${_alias}_${++paramCount}`;
    }
    this.parametersMap.set(key, value);
    return this.formatKey(key, with$);
  }

  formatKey(key: string, with$ = false) {
    return with$ ? `$${key}` : key;
  }

  toParametersObject(): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};
    for (const [key, value] of this.parametersMap) {
      parameters[key] = value;
    }
    return parameters;
  }
}
