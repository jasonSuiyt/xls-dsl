import { MqType } from "../enums/mq-type";

export interface MqMessage {
    id?: string;
    type: MqType;
}
