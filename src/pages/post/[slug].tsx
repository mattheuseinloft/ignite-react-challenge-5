import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import * as Prismic from '@prismicio/client';
import { asHTML, asText } from '@prismicio/helpers';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  uid: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const estimatedReadTime = useMemo(() => {
    const totalWords = post.data.content.reduce((prev, curr) => {
      return (
        prev +
        curr.heading.split(/[\s]+/).length +
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        asText(curr.body as any).split(/[\s]+/).length
      );
    }, 0);

    return Math.ceil(totalWords / 200);
  }, [post.data.content]);

  return router.isFallback ? (
    <h1>Carregando...</h1>
  ) : (
    <main>
      {/* {post.data.banner.url && <img src={post.data.banner.url} alt="banner" />} */}
      <img className={styles.banner} src={post.data.banner.url} alt="banner" />

      <div className={styles.postContainer}>
        <h1 className={styles.postTitle}>{post.data.title}</h1>
        <div className={commonStyles.postDetails}>
          <FiCalendar />
          <time>
            {format(new Date(post.first_publication_date), `dd MMM yyyy`, {
              locale: ptBR,
            })}
          </time>

          <FiUser />
          <span>{post.data.author}</span>

          <FiClock />
          <span>{estimatedReadTime} min</span>
        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.contentGroup}>
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

  return { paths, fallback: true };
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
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner?.url ?? '',
      },
      author: response.data.author,
      content: response.data.content,
    },
    uid: response.uid || String(slug),
  };

  return {
    props: {
      post,
    },
  };
};
