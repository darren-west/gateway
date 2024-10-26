import { createTenv, type Service } from '@internal/e2e';
import { beforeAll, expect, it } from 'vitest';

const { fs, service, gateway, composeWithApollo } = createTenv(__dirname);

let services!: Service[];
let supergraph!: string;
beforeAll(async () => {
  services = [
    await service('accounts'),
    await service('inventory'),
    await service('products'),
    await service('reviews'),
  ];

  supergraph = await fs.read(await composeWithApollo(services));
});

it.concurrent.each([
  {
    name: 'TestQuery',
    query: /* GraphQL */ `
      fragment User on User {
        id
        username
        name
      }

      fragment Review on Review {
        id
        body
      }

      fragment Product on Product {
        inStock
        name
        price
        shippingEstimate
        upc
        weight
      }

      query TestQuery {
        users {
          ...User
          reviews {
            ...Review
            product {
              ...Product
              reviews {
                ...Review
                author {
                  ...User
                  reviews {
                    ...Review
                    product {
                      ...Product
                    }
                  }
                }
              }
            }
          }
        }
        topProducts {
          ...Product
          reviews {
            ...Review
            author {
              ...User
              reviews {
                ...Review
                product {
                  ...Product
                }
              }
            }
          }
        }
      }
    `,
  },
])('should execute $name', async ({ query }) => {
  const supergraphFile = await fs.tempfile('supergraph.graphql');
  await fs.write(supergraphFile, supergraph);
  const { execute } = await gateway({ supergraph: supergraphFile });
  await expect(execute({ query })).resolves.toMatchSnapshot();
});