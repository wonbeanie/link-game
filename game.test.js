/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';

jest.mock('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
jest.mock("https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js");

describe('테스트', () => {
  const html = fs.readFileSync(path.resolve(__dirname, "./index.html"), 'utf8');
  document.body.innerHTML = html.toString();

  beforeEach(() => {
    import("./game.js");
  });

  test('닉네임 변경 확인', () => {
    const input = screen.getByPlaceholderText('닉네임을 입력하세요');

    expect(input).toBeInTheDocument();
  });
});