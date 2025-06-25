from websockets.sync.server import serve
import logging
import socket
import struct
from threading import Thread

logger = logging.getLogger(__name__)
logging.basicConfig(format="%(asctime)s %(message)s", filename='logs/opscreenWorker.log', level=logging.DEBUG)

def CommandsThread(websocket):
    
    global s

    logger.debug("Commands thread started")

    try:
        while True:
            data= websocket.recv(2048)
            logger.debug("Command received: " + data)
            s.sendall( ("sec setIo():\n " + data + "end\n").encode())

    except Exception as e:
        logger.debug("Secondary socket error - closing CommandsThread" + str(e)) 

def IosThread(websocket):
    
    global s
    global forceExit

    logger.debug("Ios thread started")

    latestString = ""
    firstMessage = True

    #Needs to stop on socket close, detected only when tries to send data
    try:
        while forceExit != True:
            data = s.recv(2048)
            l, type = struct.unpack(">iB", data[0:5])
    
            if type == 16:
                shift = 5
                while shift<l:
                    l2, subtype = struct.unpack(">iB", data[shift+0:shift+5])
                    if subtype == 3:
                        digIn, digOut = struct.unpack(">ii", data[shift+5:shift+13])

                        anDom0, anDom1, anOut0, anOut1 = struct.unpack(">BBdd", data[shift+31:shift+49])
                        if anDom0 == 0:
                            anVal0 = ((anOut0*1000) - 4.0)/(20.0-4.0)
                        else:
                            anVal0 = anOut1/10.0
                        if anDom1 == 0:
                            anVal1 = ((anOut1*1000) - 4.0)/(20.0-4.0)
                        else:
                            anVal1 = anOut1/10.0

                        newString = format(digIn, '016b')[::-1] + format(digOut, '016b')[::-1] + f"{int(anVal0*100):03}" + f"{int(anVal1*100):03}"
                        if (newString != latestString) or firstMessage:
                            latestString = newString
                            firstMessage = False
                            websocket.send( newString )
                    shift = shift+l2
    except Exception as e:
        logger.debug("Secondary socket error - closing IosThread" + str(e)) 

    logger.debug("Secondary socket - closing IosThread cleanly" + str(e)) 

# Connection handler that starts updataFromClient, updateToClient and rtdeIO
def handler(websocket):

    global logger
    global s
    global forceExit
    forceExit = False

    s = socket.socket()

    logger.debug("Connection handler started")

    s.connect(('urcontrol-secondary', 30002))
    
    readFromClient_thread = Thread(target=CommandsThread, args=[websocket])
    readFromClient_thread.start()

    sendToClient_thread = Thread(target=IosThread, args=[websocket])
    sendToClient_thread.start()

    readFromClient_thread.join()
    forceExit = True
    sendToClient_thread.join()
    forceExit = False

    try:
        s.close()
    except Exception as e:
        logger.debug("Secondary socket already closed - moving on")

    logger.debug("Connection handler stopped")

# Main loop that serves the connections
with serve(handler, "", 55510) as server:
    logger.info("Server started - waiting for connections")
    server.serve_forever()
