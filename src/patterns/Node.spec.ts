import { Node } from './Node';

describe('Node', () => {
  describe.each([undefined, '', 'alias'])(
    'alias: %p',
    (alias: string | undefined) => {
      const aliasString = alias ?? '';
      describe.each([[[]], [['Label']], [['Label1', 'Label2']]])(
        'labels: %p',
        (labels: string[]) => {
          const labelsString = labels.length > 0 ? `:${labels.join(':')}` : '';
          describe.each([undefined, { id: '$id' }])(
            'properties: %p',
            (properties?: Record<string, string>) => {
              const propertiesString = properties ? '{ id: $id }' : '';
              const expected = `(${aliasString}${labelsString}${propertiesString})`;
              it(`should build ${expected}`, () => {
                const node = new Node(alias, labels, properties);
                expect(node.build()).toBe(expected);
              });
            },
          );
        },
      );
    },
  );
});
