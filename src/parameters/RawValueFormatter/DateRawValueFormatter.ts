import { IRawValueFormatter } from './RawValueFormatter.interface';
import { Date } from 'neo4j-driver';

export class DateRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: Date) {}

  format(): string {
    return `date("${this.value.toString()}")`;
  }
}
