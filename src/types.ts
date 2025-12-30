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
  NONE = 'none',
  REQUEST_TO_UPGRADE = 'request-to-upgrade'
}

export type Project = {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  is_owner: boolean;
  is_shared: boolean;
  address_domain?: string;
  owner_email?: string;
  shareable_link?: string;
  link_is_active: boolean;
  onyx_project_id?: number;
  created_at?: string;
  updated_at?: string;
}


export type Model = {
  id: string;
  name: string;
  tier?: 'free' | 'starter' | 'professional';
}