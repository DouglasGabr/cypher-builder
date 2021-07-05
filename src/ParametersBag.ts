export class ParametersBag {
  private parametersMap: Map<unknown, string>;
  constructor(initialMap?: Map<unknown, string>) {
    this.parametersMap = initialMap ?? new Map<unknown, string>();
  }

  add(value?: unknown): string {
    if (this.parametersMap.has(value)) {
      return this.parametersMap.get(value)!;
    }
    const param = `$param${this.parametersMap.size + 1}`;
    this.parametersMap.set(value, param);
    return param;
  }
}
