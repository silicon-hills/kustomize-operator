import { string2Resources } from '~/services/util';

describe('string2Resources(resourcesStr)', () => {
  it('should convert string to resources', async () => {
    const resourcesStr = `
hello: world
---
one:
  two: three
----
abc: defg
`;
    expect(string2Resources(resourcesStr)).toMatchObject([
      { hello: 'world' },
      { one: { two: 'three' } },
      { abc: 'defg' }
    ]);
  });
});
