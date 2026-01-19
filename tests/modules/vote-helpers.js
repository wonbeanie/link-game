import { screen, waitFor, within } from "@testing-library/dom";
import { mockDatabaseUpdate, nickname, userNickname } from "../__mocks__/mock-firebase-database";

export async function setupVoting(stateSetting) {
  async function checkAlert(alertTitle = setupVotingSetting.SUSPECT_EXPOSED){
    jest.advanceTimersByTime(60000);
    const regx = new RegExp(alertTitle);

    await waitFor(()=>{
      const alert = screen.getByRole('heading', { 
        level: 3, 
        name: regx
      });

      expect(alert).toBeVisible();
    }, {timeout : 5000});
  }

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

  await checkAlert(stateSetting);
}

async function notfoundsuspect(){
  const userVoting = nickname;
  const chiefVoting = nickname;
  const suspect = userNickname;

  doneVoteInit({userVoting, chiefVoting, suspect});

  const {nicknameLog, votingLog} = await checkVoting(nickname);

  expect(nicknameLog).toHaveLength(2);
  expect(votingLog).toHaveLength(2);
}

async function foundSuspect(){
  const userVoting = userNickname;
  const chiefVoting = userNickname;
  const suspect = userNickname;

  doneVoteInit({userVoting, chiefVoting, suspect});

  const {nicknameLog, votingLog} = await checkVoting(userNickname);

  expect(nicknameLog).toHaveLength(2);
  expect(votingLog).toHaveLength(2);
}

async function tieVotes(){
  const userVoting = nickname;
  const chiefVoting = userNickname;
  const suspect = nickname;

  doneVoteInit({userVoting, chiefVoting, suspect});

  const {nicknameLog, votingLog} = await checkVoting(nickname);

  expect(nicknameLog).toHaveLength(2);
  expect(votingLog).toHaveLength(1);

  const {nicknameLog : userLog, votingLog : userVotingLog} = await checkVoting(userNickname);

  expect(userLog).toHaveLength(2);
  expect(userVotingLog).toHaveLength(1);
}

async function suspectExposed(){
  const userVoting = nickname;
  const chiefVoting = nickname;
  const suspect = nickname;

  doneVoteInit({userVoting, chiefVoting, suspect});

  const {nicknameLog, votingLog} = await checkVoting(nickname);

  expect(nicknameLog).toHaveLength(2);
  expect(votingLog).toHaveLength(2);
}

function doneVoteInit({userVoting, chiefVoting, suspect}){
  let result = {};
  result[`Sequence`] = null;
  result[`SuspectList-${userNickname}`] = userVoting;
  result[`SuspectList-${nickname}`] = chiefVoting;
  result['Suspect'] = suspect;

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
