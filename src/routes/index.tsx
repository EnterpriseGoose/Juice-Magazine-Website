import { Title } from '@solidjs/meta';
import Card from '~/components/card';
import axios from 'axios';
import { createEffect, createSignal, For, onMount } from 'solid-js';

import data from '../public/data.json';

const urlRegex =
  /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

const getGames = async () => {
  'use server';
  let res = await axios.get(
    'https://juice.hackclub.com/api/get-magazine?token=W1V53YYm5FL3xTAW'
  );

  //let res = { data };

  return res.data;
};

interface User {
  id: string;
  'Code URL': string;
  'Playable URL': string;
  videoURL: string;
  'First Name': string;
  'Last Name': string;
  'Github Username': string;
  Description: string;
  Screenshot: {
    id: string;
    width: number;
    height: number;
    url: string;
  }[];
  SlackHandle: string[];
}

export interface Game {
  codeURL: string;
  playableURL: string;
  videoURL: string;
  authors: {
    name: string;
    githubUsername: string;
    slackHandle: string;
    description: string;
    screenshotURL: string;
  }[];
}

export default function Home() {
  const [users, setUsers] = createSignal<User[]>([]);
  const [games, setGames] = createSignal([]);

  onMount(async () => {
    console.log('fetching users');
    if (
      localStorage.getItem('users') &&
      localStorage.getItem('lastUpdated') &&
      new Date(localStorage.getItem('lastUpdated') || '').getTime() >
        Date.now() - 1000 * 60 * 60 * 24 * 14
    ) {
      console.log('using local storage');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(users);
    } else {
      let res = await getGames();
      console.log(res);
      localStorage.setItem('users', JSON.stringify(res));
      localStorage.setItem('lastUpdated', new Date().toISOString());
      setUsers(res as any);
    }

    console.log('calculating games...');
    setGames(
      (users() as any[]).reduce((prev: Game[], curr: User, i) => {
        curr['Code URL'] = curr['Code URL'].trim();
        if (
          !curr['Code URL'] ||
          !curr['Playable URL'] ||
          !curr['Code URL'].match(urlRegex) ||
          !curr['Playable URL'].match(urlRegex)
        )
          return prev;
        let game = prev.find(
          (findGame) => findGame.playableURL == curr['Playable URL']
        );
        if (!game) {
          game = {
            codeURL: curr['Code URL'],
            playableURL: curr['Playable URL'],
            videoURL: curr.videoURL,
            authors: [
              {
                name: curr['First Name'] + ' ' + curr['Last Name'],
                githubUsername: curr['Github Username'],
                slackHandle: curr.SlackHandle ? curr.SlackHandle[0] : '',
                description: curr.Description,
                screenshotURL: curr.Screenshot ? curr.Screenshot[0].url : '',
              },
            ],
          };
          prev.push(game);
        } else {
          game.authors.push({
            name: curr['First Name'] + ' ' + curr['Last Name'],
            githubUsername: curr['Github Username'],
            slackHandle: curr.SlackHandle ? curr.SlackHandle[0] : '',
            description: curr.Description,
            screenshotURL: curr.Screenshot ? curr.Screenshot[0].url : '',
          });
        }
        return prev;
      }, [])
    );
    console.log('games calculated');
    console.log(games());
  });

  return (
    <main>
      <For each={games()}>{(game, i) => <Card game={game} i={i()} />}</For>
    </main>
  );
}
