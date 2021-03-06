import axios from 'axios'
import io from 'socket.io-client'
const socket = io('ws://localhost:9093')

const MSG_LIST = 'MSG_LIST'
const MSG_READ = 'MSG_READ'
const MSG_RECV = 'MSG_RECV'

const initState = {
  chatmsg:'',
  users:{},
  unread:0
}

export function chat(state = initState, action){
  switch (action.type) {
    case MSG_LIST:
      return {...state, chatmsg:action.payload.msgs, unread:action.payload.msgs.filter(v=>!v.read).length, users:action.payload.users}
    // case MSG_READ:
    case MSG_RECV:
      return {...state, chatmsg:[...state.chatmsg, action.payload], unread:state.unread+1}
    default:
      return state
  }
}


function msgList(msgs, users){
  return {type:MSG_LIST, payload:{msgs, users}}
}
export function getMsgList(){
  return dispatch=>{
    axios.get('/user/getmsglist')
    .then(res=>{
      if(res.status==200 && res.data.code==0){
        dispatch(msgList(res.data.msgs, res.data.users))
      }
    })
  }
}

export function sendMsg({from,to,msg}){
  return dispatch=>{
    socket.emit('sendmsg',{from,to,msg})
  }
}

function msgRecv(msg){
  return {type:MSG_RECV,payload:msg}
}
export function recvMsg(){
  return dispatch=>{
    socket.on('recvmsg', function(data){
      dispatch(msgRecv(data))
    })
  }
}
