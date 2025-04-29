import { For, Show } from 'solid-js';
import styles from './card.module.scss';
import { type Game } from '../routes/index';

export default function Card(props: { game: Game; i: number }) {
  return (
    <div class={styles.card}>
      <p class={styles.index}>{props.i}</p>
      <p>Game screenshots:</p>
      <div class={styles.row}>
        <For each={props.game.authors}>
          {(author) => <img src={author.screenshotURL} />}
        </For>
      </div>
      <div class={styles.row}>
        <div>
          <p>Playable URL:</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${props.game.playableURL}`}
          />
        </div>
        <div>
          <p>Code URL:</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${props.game.codeURL}`}
          />
        </div>
        <div>
          <p>Video URL:</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${props.game.videoURL}`}
          />
        </div>
      </div>
      <p>
        by:{' '}
        {props.game.authors.reduce(
          (str, author, i) =>
            `${str}${
              i > 0 ? (i == props.game.authors.length - 1 ? ' &' : ',') : ''
            } ${author.name}${
              author.slackHandle ? ` (${author.slackHandle})` : ''
            }`,
          ''
        )}
      </p>
      <For each={props.game.authors}>
        {(author) => (
          <p>
            <For each={author.description.split('\n')}>
              {(str) => (
                <>
                  <br />
                  {str}
                </>
              )}
            </For>{' '}
            <br /> - {author.name}
            {author.slackHandle ? ` (${author.slackHandle})` : ''}
          </p>
        )}
      </For>
    </div>
  );
}
