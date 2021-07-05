export class ParametersBag {
  private parametersMap: Map<unknown, string>;
  constructor(initialMap?: Map<unknown, string>) {
    this.parametersMap = initialMap ?? new Map<unknown, string>();
  }

  add(value?: unknown, with$ = false): string {
    if (!this.parametersMap.has(value)) {
      const param = `param${this.parametersMap.size + 1}`;
      this.parametersMap.set(value, param);
    }
    return this.get(value, with$)!;
  }

  get(value?: unknown, with$ = false): string | undefined {
    const param = this.parametersMap.get(value);
    if (param) {
      return with$ ? `$${param}` : param;
    }
  }
}
