import store from './store'
import Vue from 'vue'

const url = 'ws://127.0.0.1:8090'

export interface SubReq {
  section: string,
  component: string,
  insert: boolean,
  keys?: any
}

interface ClientMsg {
  SubReq?: SubReq,
  Action?: any
}

class SocketClass extends WebSocket {
  constructor(url: string) {
    super(url)
    this.addEventListener("message", function (msg) {
      // console.log(msg)
      let data = JSON.parse(msg.data)
      
      
      if (data.mutation) {
        store.commit(data.mutation, data.inner)
      }
      if (data.SubPush) {
        store.commit("subPush" + data.SubPush.section, data.SubPush)
      }
    })
  }
  
  sendObj(obj: ClientMsg) {
    const str = JSON.stringify(obj)
    this.send(str)
  }
  
  subReq(section: string, component: string, insert: boolean, keys = false) {
    let obj: ClientMsg = {
      SubReq: {
        section: section,
        insert,
        component,
      }
    }
    
    if (keys) {
      // @ts-ignore
      obj.SubReq['keys'] = keys
    }
    store.commit("updateActiveSubs", obj.SubReq)
    if (!insert) {
      store.commit("delData" + section, {section, component})
    }
    
    console.log("Sending SubReq: ", obj)
    this.sendObj(obj)
    
  }
}

const Socket = new SocketClass(url)

/*
let Socket = new WebSocket(url)
Socket.subReq = subReq

Socket.addEventListener("open", () => {
  store.commit("socketOnOpen")
  // request date subscription
  // subReq("Time", "Date", true);
})

Socket.



// could do validation of subscription requests, but let's just do it serverside
/*
let validation = new Map([
  ["Agr", new Set(["FarmData", "BaseFarmData", "FoodStore"])],
  ["Terr", new Set(["Region", "Weather", "RiverID", "LandMassID", ])]
])*/

/*
export function

*/

export default Socket
