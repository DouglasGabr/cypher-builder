import { IRawValueFormatter } from './RawValueFormatter.interface';

export class BooleanRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: boolean) {}
  format(): string {
    return this.value.toString();
  }
}
