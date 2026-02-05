export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}


export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role?: string;
}
