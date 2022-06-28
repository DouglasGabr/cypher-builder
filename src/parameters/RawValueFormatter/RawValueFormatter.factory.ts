import neo4j from 'neo4j-driver';
import { ArrayRawValueFormatter } from './ArrayRawValueFormatter';
import { BooleanRawValueFormatter } from './BooleanRawValueFormatter';
import { DateRawValueFormatter } from './DateRawValueFormatter';
import { DateTimeRawValueFormatter } from './DateTimeRawValueFormatter';
import { DurationRawValueFormatter } from './DurationRawValueFormatter';
import { IntRawValueFormatter } from './IntRawValueFormatter';
import { LocalDateTimeRawValueFormatter } from './LocalDateTimeRawValueFormatter';
import { LocalTimeRawValueFormatter } from './LocalTimeRawValueFormatter';
import { NumberRawValueFormatter } from './NumberRawValueFormatter';
import { ObjectRawValueFormatter } from './ObjectRawValueFormatter';
import { PointRawValueFormatter } from './PointRawValueFormatter';
import { IRawValueFormatter } from './RawValueFormatter.interface';
import { StringRawValueFormatter } from './StringRawValueFormatter';
import { TimeRawValueFormatter } from './TimeRawValueFormatter';

export class RawValueFormatterFactory {
  static create(value: unknown): IRawValueFormatter {
    if (typeof value === 'number') {
      return new NumberRawValueFormatter(value);
    } else if (typeof value === 'string') {
      return new StringRawValueFormatter(value);
    } else if (typeof value === 'boolean') {
      return new BooleanRawValueFormatter(value);
    } else if (Array.isArray(value)) {
      return new ArrayRawValueFormatter(value);
    } else if (typeof value === 'object' && value) {
      return new ObjectRawValueFormatter(value);
    } else if (value instanceof neo4j.types.DateTime) {
      return new DateTimeRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Integer) {
      return new IntRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Duration) {
      return new DurationRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Point) {
      return new PointRawValueFormatter(value);
    } else if (value instanceof neo4j.types.LocalTime) {
      return new LocalTimeRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Time) {
      return new TimeRawValueFormatter(value);
    } else if (value instanceof neo4j.types.LocalDateTime) {
      return new LocalDateTimeRawValueFormatter(value);
    } else if (value instanceof neo4j.types.Date) {
      return new DateRawValueFormatter(value);
    }
    throw new Error(`Unsupported value type: ${typeof value}`);
  }
}
