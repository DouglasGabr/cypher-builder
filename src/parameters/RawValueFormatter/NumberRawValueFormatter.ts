import { IRawValueFormatter } from './RawValueFormatter.interface';

export class NumberRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: number) {}
  format(): string {
    return this.value.toString();
  }
}
