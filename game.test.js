/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, "./index.html"), 'utf8');

describe('테스트', () => {
  beforeEach(() => {
    document.body.innerHTML = html.toString();

    // import('./game.js').then((module)=>{
    //   module.init();
    // });
  });

  test('닉네임 변경 확인', () => {
    const input = screen.getByPlaceholderText('닉네임을 입력하세요');

    expect(input).toBeInTheDocument();
  });
});