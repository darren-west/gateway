import { defineConfig } from '@graphql-mesh/compose-cli';
import { Opts } from '@internal/testing';
import { loadThriftSubgraph } from '@omnigraph/thrift';

const opts = Opts(process.argv);

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadThriftSubgraph('calculator', {
        source: './services/calculator/calculator.thrift',
        endpoint: `http://localhost:${opts.getServicePort('calculator')}/thrift`,
        serviceName: 'Calculator',
      }),
    },
  ],
});
