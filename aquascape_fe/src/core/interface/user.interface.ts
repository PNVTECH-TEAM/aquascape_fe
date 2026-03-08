export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}

export interface DesignItem {
  id: number;
  title: string;
  status: string;
  image: string;
}