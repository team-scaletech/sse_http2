class EventHandler{
    totalConnections = 0
    outGoingRequest = new Map();
    outGoingResponse = new Map();
    
    triggerOutgoingresponse(){
        console.log("event triggered started for ", this.totalConnections)
        if(this.outGoingRequest && this.totalConnections){
            this.outGoingResponse.forEach(res => {
                res.write(`data: ${new Date()}\n\n`);
            })
            console.log("event triggered finished for ", this.totalConnections)
        }   
    }
}

module.exports = { EventHandler }