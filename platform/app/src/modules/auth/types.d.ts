import { Roles } from "../consts";

export type UserData = {
  id: number;
  username: string;
  email: string;
  role_name: string;
  first_name: string;
  last_name: string;
  has_usable_password: boolean;
  days_to_pass_change: number | null;
  role: Roles;
};

export type MethodInfo = {
  method: string;
  username: string;
  at: number;
};

export type MetaInfo = {
  is_authenticated: boolean;
};

export type FlowInfo = {
  id: string;
  is_pending: boolean;
  types?: string[] | undefined;
};

export type AuthorizationResponse = {
  status: number;
  data: {
    user: UserData | null;
    methods: MethodInfo[];
    flows?: FlowInfo[] | undefined;
  };
  meta: MetaInfo;
};

