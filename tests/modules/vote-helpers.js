import { screen, waitFor, within } from "@testing-library/dom";
import { mockDatabaseUpdate, nickname, secondNickname, thirdNickname, userNickname } from "../__mocks__/mock-firebase-database";
import { checkAlert } from "./game-helpers";
import { TABLE_KEYS } from "../../database";

export async function setupVoting(stateSetting) {
  await waitFor(()=>{
    const timer = screen.getByText(/01:00/i);
    expect(timer).toBeVisible();
  }, {timeout : 5000});

  switch(stateSetting){
    case setupVotingSetting.SUSPECT_EXPOSED:
      suspectExposed();
      break;
    case setupVotingSetting.FOUND_SUSPECT:
      foundSuspect();
      break;
    case setupVotingSetting.TIE_VOTES:
      tieVotes();
      break;
    case setupVotingSetting.NOTFOUND_SUSPECT:
      notfoundsuspect();
      break;
    default:
      fail("올바르지 않는 상황입니다.");
  }

  jest.advanceTimersByTime(60000);

  await checkAlert(stateSetting);
}

async function notfoundsuspect(){
  await voteTestFlow({
    votingList : [
      [userNickname, nickname],
      [nickname, nickname]
    ],
    suspect : userNickname
  })
}

async function foundSuspect(){
  await voteTestFlow({
    votingList : [
      [userNickname, userNickname],
      [nickname, userNickname]
    ],
    suspect : userNickname
  })
}

async function tieVotes(){
  await voteTestFlow({
    votingList : [
      [userNickname, nickname],
      [nickname, userNickname],
      [secondNickname, nickname],
      [thirdNickname, userNickname],
    ],
    suspect : nickname
  });
}

async function suspectExposed(){
  await voteTestFlow({
    votingList : [
      [userNickname, nickname],
      [nickname, nickname]
    ],
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

export const setupVotingSetting = {
  NOTFOUND_SUSPECT : "범인이 아닙니다.",
  FOUND_SUSPECT : "범인을 찾았습니다.",
  TIE_VOTES : "투표 동점",
  SUSPECT_EXPOSED : "범인인것을 걸렸습니다.",
};


export const MOCK_FAKE_CORRECT = "가짜 정답";
export const MOCK_CORRECT = "정답";