import { RawValueFormatterFactory } from './RawValueFormatter.factory';
import { IRawValueFormatter } from './RawValueFormatter.interface';

export class ObjectRawValueFormatter implements IRawValueFormatter {
  private entries: [string, IRawValueFormatter][];
  constructor(value: object) {
    this.entries = Object.entries(value).map(([key, value]) => [
      key,
      RawValueFormatterFactory.create(value),
    ]);
  }
  format(): string {
    return `{ ${this.entries
      .map(([k, v]) => `${k}: ${v.format()}`)
      .join(', ')} }`;
  }
}
