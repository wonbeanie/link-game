export function Chat(onSendClick){
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatWindow = document.getElementById('chat-window');
  let startChat = false;

  function addChatMessage(nickname, message) {
    if(!startChat){
      return;
    }
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    msgDiv.innerHTML = `<b>${nickname}:</b> ${message}`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function chatClear(){
    chatWindow.innerHTML = "";
    if(startChat){
      addChatMessage("서버", "채팅에 접속하였습니다.");
      return;
    }
  }

  function chatStart(){
    chatSend.addEventListener('click', sendClick);
    chatInput.addEventListener('keypress', onEnterPress);
    startChat = true;
    addChatMessage("서버", "채팅에 접속하였습니다.");
  }

  function sendClick(){
    const msg = chatInput.value.trim();
    onSendClick(msg);
    chatInput.value = '';
  }

  function chatClose(){
    chatSend.removeEventListener('click', sendClick);
    chatInput.removeEventListener('keypress', onEnterPress);
    addChatMessage("서버", "채팅이 종료되었습니다.");
    startChat = false;
  }

  function onEnterPress(e){
    if (e.key === 'Enter') chatSend.click();
  }

  return {
    addChatMessage,
    chatStart,
    chatClose,
    chatClear
  };
}