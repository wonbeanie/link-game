export const GameEvents = {
  GAME_OVER : "game:over",
  PLAYER_OUT : "game:player_out",
  RELOAD_EVENT : "game:reload",
  CHANGE_START : "game:changeStart",

  ADD_LOG : "log:add",
  DRAW_LOG : "log:draw",

  VOTE_START : "vote:start",
  VOTE_END : "vote:end",
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
}