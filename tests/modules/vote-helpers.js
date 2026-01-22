import { screen, waitFor, within } from "@testing-library/dom";
import { mockDatabaseUpdate, nickname, secondNickname, thirdNickname, userNickname } from "../__mocks__/mock-firebase-database";
import { checkAlert } from "./game-helpers";
import { TABLE_KEYS } from "../../database";

export async function setupVoting(stateSetting, addPlayerList = []) {
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
      await foundSuspect(playerList);
      break;
    case setupVotingSetting.TIE_VOTES:
      await tieVotes(playerList);
      break;
    case setupVotingSetting.NOTFOUND_SUSPECT:
      await notfoundsuspect(playerList);
      break;
    default:
      fail("올바르지 않는 상황입니다.");
  }

  jest.advanceTimersByTime(60000);
  await checkAlert(stateSetting);
}

async function notfoundsuspect(playerList){
  const votingList = playerList.map((player)=>{
    return [player, nickname]
  });

  await voteTestFlow({
    votingList : votingList,
    suspect : userNickname
  })
}

async function foundSuspect(playerList){
  const votingList = playerList.map((player)=>{
    return [player, userNickname]
  });

  await voteTestFlow({
    votingList,
    suspect : userNickname
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
  doneVoteInit(voteSetting);

  await checkVoting(voteSetting.votingList);
}

function doneVoteInit({votingList, suspect}){
  let result = {};
  result[TABLE_KEYS.SEQUENCE] = null;

  votingList.forEach(([player, voting])=> {
    result[`${TABLE_KEYS.SUSPECT_LIST}-${player}`] = voting;
  })
  result[TABLE_KEYS.SUSPECT] = suspect;
  result[TABLE_KEYS.CORRECT] = MOCK_CORRECT;
  result[TABLE_KEYS.FAKE_CORRECT] = MOCK_FAKE_CORRECT;

  mockDatabaseUpdate(result, false, true);
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

  const { findAllByText } = within(logDisplay);
  
  for( const voteNickname of Object.keys(voteCount)){
    const votingLog = await findAllByText(`${voteNickname}님을 투표하였습니다.`);

    expect(votingLog.length).toBe(voteCount[voteNickname]);

    votingLog.forEach((votingElement)=>{
      const userElement = votingElement.closest('.player-hint-item').querySelector(':first-child');

      const userNickname = userElement.textContent;

      expect(voting[userNickname]).toBe(voteNickname);
    })
  }
}

export function checkSelectPlayerList(playerCount = 2){
  const suspectSelectLabel = screen.getByText(/범인 지목 투표/);
  const votingSelect = suspectSelectLabel.nextElementSibling;
  expect(votingSelect).toHaveAttribute("id", "player-select");
  expect(votingSelect.childElementCount).toBe(playerCount);
}

export const setupVotingSetting = {
  NOTFOUND_SUSPECT : "범인이 아닙니다.",
  FOUND_SUSPECT : "범인을 찾았습니다.",
  TIE_VOTES : "투표 동점",
  SUSPECT_EXPOSED : "범인인것을 걸렸습니다.",
};


export const MOCK_FAKE_CORRECT = "가짜 정답";
export const MOCK_CORRECT = "정답";