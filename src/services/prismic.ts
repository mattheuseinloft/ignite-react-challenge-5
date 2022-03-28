import * as Prismic from '@prismicio/client';
// import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(): Prismic.Client {
  const prismic = Prismic.createClient(process.env.PRISMIC_API_ENDPOINT, {
    // req,
  });

  return prismic;
}
