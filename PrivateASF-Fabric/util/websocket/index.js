// My recreation of the WebSocket index since I needed some more functions and slightly changed definitions
// need the module for the jar mod tho :)

export default class WebSocketPASF {
    constructor(address) {
        this.address = address;

        this.onMessage = (msg) => {};
        this.onError = (err) => {};
        this.onOpen = () => {};
        this.onClose = () => {};

        const _this = this;

        this.socket = new JavaAdapter(org.java_websocket.client.WebSocketClient, {    
            onMessage(message) {
                _this.onMessage(message)
            },
            onError(exception) {
                _this.onError(exception);
            },
            onOpen(handshake) {
                _this.onOpen(handshake);
            },
            onClose(code, reason, remote) {
                _this.onClose(code, reason, remote);
            }
        }, new java.net.URI(this.address));
    }
    
    close() {
        if (this.socket) {
            this.socket.close();
        }
    }

    send(message) {
        this.socket.send(message);
    }

    connect() {
        this.socket.connect();
    }

    close() {
        this.socket.close();
    }

    isOpen() {
        return this.socket && this.socket.isOpen()
    }

    reconnect() {
        this.socket.reconnect();
    }
}
