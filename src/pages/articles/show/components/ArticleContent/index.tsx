import React from 'react';
import { Icon } from 'antd';
import { get } from 'lodash';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import marked from 'marked';
import { showTime, getDefaultMarkedOptions, resetMarkedOptions } from '@/utils/utils';
import { IArticle } from '@/models/data';
import Tocify from './tocify';
import styles from './style.less';

interface ArticleContentProps {
  article?: IArticle;
  getTocify?: (tocify: Tocify) => void;
}

export default class ArticleContent extends React.Component<ArticleContentProps> {
  markdown: any;

  tocify: Tocify;

  constructor(props: ArticleContentProps) {
    super(props);

    this.tocify = new Tocify();
  }

  async componentDidMount() {
    const { getTocify } = this.props;

    if (getTocify) {
      getTocify(this.tocify);
    }

    // https://webpack.docschina.org/guides/code-splitting/#%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5-dynamic-imports-
    const [{ default: jQuery }, { debounce, throttle }]: any = await Promise.all([
      import(/* webpackChunkName: 'jquery' */ 'jquery'),
      // @ts-ignore
      import(/* webpackChunkName: 'throttle-debounce' */ 'throttle-debounce'),
    ]);

    jQuery.debounce = debounce;
    jQuery.throttle = throttle;
    window.jQuery = jQuery;

    await Promise.all([
      // @ts-ignore
      import(/* webpackChunkName: 'fluidbox' */ 'fluidbox'),
      import(/* webpackChunkName: 'fluidbox' */ 'fluidbox/dist/css/fluidbox.min.css'),
    ]);

    /* eslint no-undef:0, func-names:0 */
    // @ts-ignore
    jQuery(this.markdown)
      .find('img:not(.joypixels)')
      .each(function () {
        // @ts-ignore
        jQuery(this).wrap(`<a href="${jQuery(this).attr('src')}" class="fluidbox"></a>`);
      })
      .promise()
      // @ts-ignore
      .done(() => jQuery(this.markdown).find('a.fluidbox').fluidbox());
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    resetMarkedOptions();
  }

  setMarkdownRef = (ref: any) => {
    this.markdown = ref;
  };

  createMarkup() {
    const { article } = this.props;
    if (article && article.content) {
      this.tocify.reset();

      const { renderer, ...otherOptions } = getDefaultMarkedOptions();
      renderer.heading = (text, level) => {
        const anchor = this.tocify.add(text, level);
        return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
      };
      marked.setOptions({ renderer, ...otherOptions });

      const markup = emojiToolkit.toImage(marked(article.content));

      resetMarkedOptions();

      return { __html: markup };
    }

    return { __html: null };
  }

  render() {
    const { article } = this.props;

    if (!article) {
      return null;
    }

    return (
      <div className={styles.contentBox}>
        <div className={styles.header}>
          <h1>{get(article, 'title')}</h1>
          <div className={styles.meta}>
            <a style={{ color: 'inherit' }}>
              {get(article, 'author.name')}
            </a>
            <span style={{ margin: '0 6px' }}>⋅</span>
            <span>
              <Icon type="clock-circle-o" style={{ margin: '0 4px' }} />
              {showTime(get(article, 'created_at', ''))}
            </span>
            <span style={{ margin: '0 6px' }}>⋅</span>
            <span>
              <Icon type="eye-o" style={{ marginRight: 4 }} />
              {get(article, 'current_read_count')} 阅读
            </span>
          </div>
        </div>
        <div
          ref={this.setMarkdownRef}
          className={`${styles.content} markdown-body`}
          dangerouslySetInnerHTML={this.createMarkup()}
        />
      </div>
    )
  }
}
