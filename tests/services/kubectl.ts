import path from 'path';
import Kubectl, { Output } from '~/services/kubectl';

describe.skip('new Kubectl()', () => {
  let kubectl: Kubectl;
  beforeAll(() => {
    kubectl = new Kubectl();
  });

  it('create and destroy resource', async () => {
    await kubectl.apply({
      file: path.resolve(__dirname, '../mocks/resources/configmaps')
    });
    const output = await kubectl.get({
      file: path.resolve(__dirname, '../mocks/resources/configmaps'),
      output: Output.Json
    });
    expect(output).toMatchObject({
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: 'hello'
      },
      data: {
        howdy: 'texas'
      }
    });
    await kubectl.delete({
      file: path.resolve(__dirname, '../mocks/resources/configmaps')
    });
    try {
      await kubectl.get({
        file: path.resolve(__dirname, '../mocks/resources/configmaps'),
        output: Output.Json
      });
      expect(true).toBe(true);
    } catch (err) {
      expect(err.message).toEqual(
        expect.stringContaining('configmaps "hello" not found')
      );
    }
  });
});

describe('new Kubectl().string2Resources(resourcesStr)', () => {
  it('should convert string to resources', async () => {
    const kubectl = new Kubectl();
    const resourcesStr = `
hello: world
---
one:
  two: three
----
abc: defg
`;
    expect(kubectl.string2Resources(resourcesStr)).toMatchObject([
      { hello: 'world' },
      { one: { two: 'three' } },
      { abc: 'defg' }
    ]);
  });
});
