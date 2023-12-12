import { MessageType } from "../enums/message-type";

export interface Message {
    message: string;
    type: MessageType
}
