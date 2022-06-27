import { RawValueFormatterFactory } from './RawValueFormatter/RawValueFormatter.factory';

export class ParametersBag {
  private parametersMap: Map<string, unknown>;
  constructor(initialMap?: Map<string, unknown>) {
    this.parametersMap = initialMap ?? new Map();
  }

  add(value?: unknown, with$ = false, alias?: string, force?: boolean): string {
    let paramCount = 1;
    const _alias = alias?.replace(/\W/g, '_') ?? 'param';
    let key = _alias;
    while (this.parametersMap.has(key) && !force) {
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

  getRaw(key: string): string {
    const value = this.parametersMap.get(key);
    if (typeof value === 'undefined') {
      throw new Error(`Parameter ${key} not found`);
    }
    return RawValueFormatterFactory.create(value).format();
  }
}
