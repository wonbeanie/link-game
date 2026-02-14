export const GameEvents = {
  GAME_OVER : "game:over",
  PLAYER_OUT : "game:player_out",
  RELOAD_EVENT : "game:reload",
  CHANGE_START : "game:changeStart",

  REQUEST_ADD_LOG : "log:requestAdd",
  READY_TO_ADD_LOG : "log:readyAddLog",
  DRAW_LOG : "log:draw",

  VOTE_START : "vote:start",
  REQUEST_VOTE_END : "vote:requestEnded",
  READY_TO_VOTE_END : "vote_readyVoteEnd",
  TIE_OF_VOTES : "vote:tie",
  VOTE_UPDATE : "vote:dataUpdate",

  GAME_INFOS_UPDATE : "store:gameInfosUpdate",
  SET_STATE : "store:setState",
  SET_CHAT_HISTORY : "store:setChatHistory",
  REQUEST_CHANGE_NICKNAME : "store:requestChangeNickname",
  SET_PLAYER_LIST : "store:setPlayerList",
  SET_PLAY_SEQUENCE : "store:setPlaySequence",
  SET_LAST_ANSWER : "store:setLastAnswer",

  NEXT_TURN : "hint:nextTurn",

  CHAT_START : "chat:start",
  CHAT_STOP : "chat:stop",
  CHAT_UPDATE : "chat:update",
  CLEAR_CHAT_DISPLAY : "chat:clearDisplay",
  ADD_CHAT_MESSAGE : "chat:addMessage",
  CHAT_SEND_COMPLETE : "chat:sendComplete",

  INIT_ADMIN : "admin:init",
  INIT_HINT : "hint:init",
  TURN_END_HINT : "hint:turnEndHint",
  TURN_START_HINT : "hint:turnStartHint",
  UPDATE_TURN_UI : "hint:updateTurnUI",
  READY_LOG_DATA : "log:readyLogData",
  READY_PLAYER_UI : "log:readyPlayerUI",
  DEFAULT_GAME_INFO_UPDATED : "store:defaultGameInfoUpdated",
  UPDATE_TIME : "timer:update",
  STOP_TIMER : "timer:stop",
  INIT_NICKNAME : "store:initNickname",

  CLOSE_ADMIN_MODAL : "admin:close",
  OPEN_ADMIN_MODAL : "admin:open",

  INIT_GAME_UI : "ui:initGameUi"
}