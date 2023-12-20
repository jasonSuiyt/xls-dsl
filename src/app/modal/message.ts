import { message } from '@tauri-apps/api/dialog';
import { MessageType } from "../enums/message-type";

export class Message {

    constructor(public message: string, public type: MessageType) {

    }

    public static q(message: string): Message {
        return new Message(message, MessageType.Q);
    }

    public static a(message: string): Message {
        return new Message(message, MessageType.A);
    }
}
