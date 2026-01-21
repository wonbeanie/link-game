import { screen, waitFor, within } from "@testing-library/dom";
import { mockDatabaseUpdate, nickname, userNickname } from "../__mocks__/mock-firebase-database";
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
    voteSetting : {
      userVoting : nickname,
      chiefVoting : nickname,
      suspect : userNickname
    },
    checkVotingSetting : {
      nickname : nickname,
      nicknameLogCount : 2,
      votingLogCount : 2
    }
  })
}

async function foundSuspect(){
  await voteTestFlow({
    voteSetting : {
      userVoting : userNickname,
      chiefVoting : userNickname,
      suspect : userNickname
    },
    checkVotingSetting : {
      nickname : userNickname,
      nicknameLogCount : 2,
      votingLogCount : 2
    }
  })
}

async function tieVotes(){
  await voteTestFlow({
    voteSetting : {
      userVoting : nickname,
      chiefVoting : userNickname,
      suspect : nickname
    },
    checkVotingSetting : [
      {
        nickname : nickname,
        nicknameLogCount : 2,
        votingLogCount : 1
      },
      {
        nickname : userNickname,
        nicknameLogCount : 2,
        votingLogCount : 1
      }
    ]
  });
}

async function suspectExposed(){
  await voteTestFlow({
    voteSetting : {
      userVoting : nickname,
      chiefVoting : nickname,
      suspect : nickname
    },
    checkVotingSetting : {
      nickname : nickname,
      nicknameLogCount : 2,
      votingLogCount : 2
    }
  })
}

async function voteTestFlow({voteSetting, checkVotingSetting}){
  doneVoteInit(voteSetting);

  if(!Array.isArray(checkVotingSetting)){
    checkVotingSetting = [checkVotingSetting];
  }

  for(const {nickname, nicknameLogCount, votingLogCount} of checkVotingSetting){
    const {nicknameLog, votingLog} = await checkVoting(nickname);

    expect(nicknameLog).toHaveLength(nicknameLogCount);
    expect(votingLog).toHaveLength(votingLogCount);
  }
}

function doneVoteInit({userVoting, chiefVoting, suspect}){
  let result = {};
  result[TABLE_KEYS.SEQUENCE] = null;
  result[`${TABLE_KEYS.SUSPECT_LIST}-${userNickname}`] = userVoting;
  result[`${TABLE_KEYS.SUSPECT_LIST}-${nickname}`] = chiefVoting;
  result[TABLE_KEYS.SUSPECT] = suspect;
  result[TABLE_KEYS.CORRECT] = "정답";
  result[TABLE_KEYS.FAKE_CORRECT] = "가짜정답";

  mockDatabaseUpdate(result, false, true);
}

async function checkVoting(targetNickname = nickname){
  const activityLog = screen.getByText(/활동 로그/);
  const logDisplay = activityLog.nextElementSibling;
  const { findAllByText } = within(logDisplay);
  const nicknameLog = await findAllByText(targetNickname);
  const votingLog = await findAllByText(`${targetNickname}님을 투표하였습니다.`);

  return {
    nicknameLog,
    votingLog
  }
}

export const setupVotingSetting = {
  NOTFOUND_SUSPECT : "범인이 아닙니다.",
  FOUND_SUSPECT : "범인을 찾았습니다.",
  TIE_VOTES : "투표 동점",
  SUSPECT_EXPOSED : "범인인것을 걸렸습니다.",
};
