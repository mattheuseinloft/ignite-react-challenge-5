import { GetStaticPaths, GetStaticProps } from 'next';
import * as Prismic from '@prismicio/client';
import { asHTML } from '@prismicio/helpers';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <main>
      {/* {post.data.banner.url && <img src={post.data.banner.url} alt="banner" />} */}
      <img src={post.data.banner.url} alt="banner" />

      <div className={commonStyles.container}>
        <h1>{post.data.title}</h1>
        <div>
          {/* <FiCalendar /> */}
          <time>
            {format(new Date(post.first_publication_date), `dd MMM yyyy`, {
              locale: ptBR,
            })}
          </time>

          {/* <FiUser /> */}
          <span>{post.data.author}</span>

          {/* Clock icon */}
          <span>Estimated read time</span>
        </div>

        {post.data.content.map(content => (
          <div>
            <h2>{content.heading}</h2>

            <div
              // className={styles.postContent}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: asHTML(content.body as any) }}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug));

  console.log(response.data);

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner?.url ?? '',
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
