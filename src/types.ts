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

export type Project = {
  id: string;
  name: string;
  description: string;
  owner: string;
  is_owner: string;
  address_domain: string;
  owner_email: string;
  shareable_link: string;
}


export type Model = { 
  id: string; 
  name: string; 
}