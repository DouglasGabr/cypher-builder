import { IRawValueFormatter } from './RawValueFormatter.interface';

export class StringRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: string) {}
  format(): string {
    return `"${this.value.replace(/"/g, '\\"')}"`;
  }
}
