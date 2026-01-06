# LINK-GAME
### Realtime database를 기반으로 만든 간단한 라이어 게임
- 이 게임을 참고하여 제작하였습니다. (https://store.steampowered.com/app/3555700/Liar_Game/?l=koreana)
- 게임 UI Style은 GEMINI를 이용하여 적용하였습니다.

## 게임 사진
<img width="777" height="777" alt="game-screenshot" src="https://github.com/user-attachments/assets/c9ac2822-224c-4a54-9b35-a365520654ee" />

## 게임 설명
1. 제시어 확인
2. 30초 내에 연관된 힌트를 입력
3. 다른 플레이어들의 힌트를 보며 제시어가 다른 플레이어를 찾기
  > 3-1. 본인이 다른 제시어인것 같다면 시민의 제시어를 유추
4. 토론 후 제시어가 다른 플레이어를 투표로 지목
5. 범인을 찾았다면 범인은 시민의 제시어를 입력

## 필수 설정파일
- config.js이 필요합니다.
- 아래와 같이 firebase Realtime database 설정키를 입력해주시면 됩니다.
- firebase website (https://firebase.google.com/?hl=ko)
```
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
```

## 플레이 방법
1. 방장은 웹서버를 열어 `(웹서버)?admin=true`를 통해 방장 페이지로 이동합니다.
  > 1-1. 다른 플레이어는 웹서버에 접속하여 대기합니다.
2. 준비가 완료됐다면 각자 닉네임을 입력하고 방장은 다른 플레이어가 준비되었는지 확인합니다.
3. 모두 준비 완료되었다면 방장은 **'게임 시작하기'** 버튼을 클릭하여 시작합니다.
4. 항상 게임이 끝난 뒤에는 플레이어 모두 새로고침 및 방장은 초기화 버튼을 누르시면 새롭게 게임을 시작할 수 있습니다.