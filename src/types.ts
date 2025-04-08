export type messageType = {
    type: string;
    text: string;
}

export enum messageTypeEnum {
    INFO = 'info',
    ERROR = 'error',
    SUGGEST_TO_UPGRADE = 'upgrade-alert',
    SUCCESS = 'success',
    WARNING = 'warning',
    NONE='none',
    REQUEST_TO_UPGRADE = 'request-to-upgrade'
}