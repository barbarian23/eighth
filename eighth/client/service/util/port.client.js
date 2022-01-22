export class PortClient {
  static getInstance(){
    if(this.Instance == null){
      this.Instance = new PortClient();
    }
    return this.Instance
  }

  getPort(){
    return this.Port;
  }

  setPort(_port){
    return this.Port = _port;
  }
}