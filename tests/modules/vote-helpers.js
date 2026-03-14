import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
import { mockDatabaseUpdate } from "../modules/database-helpers.js";
import { nickname, userNickname } from "../__mocks__/mock-peerjs.js";
import { checkAlert } from "./game-helpers";
import { TABLE_KEYS } from "../../src/modules/modules.js";

export async function setupVoting(stateSetting, addPlayerList = [], skip = false) {
  const playerList = [nickname, ...addPlayerList];

  await waitFor(()=>{
    const timer = screen.getByText(/01:00/i);
    expect(timer).toBeVisible();
  }, {timeout : 5000});

  switch(stateSetting){
    case setupVotingSetting.SUSPECT_EXPOSED:
      await suspectExposed(playerList);
      break;
    case setupVotingSetting.FOUND_SUSPECT:
      await foundSuspect(playerList, skip);
      break;
    case setupVotingSetting.TIE_VOTES:
      await tieVotes(playerList);
      break;
    case setupVotingSetting.NOTFOUND_SUSPECT:
      await notfoundsuspect(playerList, skip);
      break;
    default:
      fail("올바르지 않는 상황입니다.");
  }

  if(skip){
    return;
  }

  jest.advanceTimersByTime(60000);
  await checkAlert(stateSetting);
}
async function notfoundsuspect(playerList, skip = false){
  const votingList = playerList.map((player)=>{
    return [player, nickname]
  });

  setupVoteSelectOption(nickname);

  await voteTestFlow({
    votingList : votingList,
    suspect : userNickname,
    skip
  })
}

async function foundSuspect(playerList, skip = false){
  const votingList = playerList.map((player)=>{
    return [player, userNickname]
  });

  setupVoteSelectOption(userNickname);

  await voteTestFlow({
    votingList,
    suspect : userNickname,
    skip
  })
}

async function tieVotes(playerList){
  let count = 0;
  const votingList = playerList.map((player)=>{
    count += 1;
    const halfCount = Math.floor(playerList.length / 2);
    return [player, count > halfCount ? nickname : userNickname]
  });

  await voteTestFlow({
    votingList,
    suspect : nickname
  });
}

async function suspectExposed(playerList){
  const votingList = playerList.map((player)=>{
    return [player, nickname]
  });

  await voteTestFlow({
    votingList,
    suspect : nickname
  })
}

async function voteTestFlow(voteSetting){
  await doneVoteInit(voteSetting);

  await checkVoting(voteSetting.votingList);
}

async function doneVoteInit({votingList, suspect, skip = false}){
  const gameStoreModule = await import('../../src/modules/game-store.js');
  const gameStore = gameStoreModule.default;

  gameStore.suspect = suspect;
  gameStore.correct = MOCK_CORRECT;
  gameStore.fakeCorrect = MOCK_FAKE_CORRECT;

  let result = {};
  result[TABLE_KEYS.SEQUENCE] = null;

  votingList.forEach(([player, voting])=> {
    result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = voting;

    if(skip && nickname !== player){
      result[`${TABLE_KEYS.VOTE_SKIP}-${player}`] = true;
    }
  })

  await mockDatabaseUpdate(result, false, true);
}

async function checkVoting(votingList){
  let voteCount = {};
  let voting = Object.fromEntries(votingList);

  votingList.forEach((user)=>{
    const voteNickname = user[1];

    voteCount[voteNickname] = voteCount[voteNickname] + 1 || 1;
  });

  const activityLog = screen.getByText(/활동 로그/);
  const logDisplay = activityLog.nextElementSibling;

  const { findAllByText, findAllByRole } = within(logDisplay);
  
  for( const voteNickname of Object.keys(voteCount)){
    const regex = new RegExp(voteNickname, "");
    const nicknameElements = await findAllByText(regex);

    const votingLog = nicknameElements.filter((nicknameElement) => {
      const className = nicknameElement.getAttribute("class");
      return className !== "name";
    });

    expect(votingLog.length).toBe(voteCount[voteNickname]);

    votingLog.forEach((votingElement)=>{
      const userElement = votingElement.closest('.mini-card').querySelector(':first-child');

      const userNickname = userElement.textContent;

      expect(voting[userNickname]).toBe(voteNickname);
    })
  }
}

export const setupVoteSelectOption = (nickname) => {
  const suspectSelectLabel = screen.getByText(/범인 지목 투표/);
  const votingSelect = suspectSelectLabel.nextElementSibling;

  fireEvent.change(votingSelect, {
    target : { value: nickname }
  });
}

export function checkSelectPlayerList(playerCount = 2){
  const suspectSelectLabel = screen.getByText(/범인 지목 투표/);
  const votingSelect = suspectSelectLabel.nextElementSibling;
  expect(votingSelect).toHaveAttribute("id", "vote-input");
  expect(votingSelect.childElementCount).toBe(playerCount);
}

export const setupVotingSetting = {
  NOTFOUND_SUSPECT : "범인이 아닙니다.",
  FOUND_SUSPECT : "범인을 찾았습니다.",
  TIE_VOTES : "투표 동점",
  SUSPECT_EXPOSED : "범인인것을 걸렸습니다.",
  SKIP : "투표 스킵",
};


export const MOCK_FAKE_CORRECT = "가짜 정답";
export const MOCK_CORRECT = "정답";