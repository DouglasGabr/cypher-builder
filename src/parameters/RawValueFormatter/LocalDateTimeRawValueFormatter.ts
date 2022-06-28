import { IRawValueFormatter } from './RawValueFormatter.interface';
import { LocalDateTime } from 'neo4j-driver';

export class LocalDateTimeRawValueFormatter implements IRawValueFormatter {
  constructor(private readonly value: LocalDateTime) {}

  format(): string {
    return `localdatetime("${this.value.toString()}")`;
  }
}
