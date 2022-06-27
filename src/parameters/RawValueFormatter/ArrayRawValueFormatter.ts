import { RawValueFormatterFactory } from './RawValueFormatter.factory';
import { IRawValueFormatter } from './RawValueFormatter.interface';

export class ArrayRawValueFormatter implements IRawValueFormatter {
  private items: IRawValueFormatter[];
  constructor(value: unknown[]) {
    this.items = value.map((v) => RawValueFormatterFactory.create(v));
  }
  format(): string {
    return `[${this.items.map((item) => item.format()).join(', ')}]`;
  }
}
