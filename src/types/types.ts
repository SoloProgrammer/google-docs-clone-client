export type Session = {
  user: User | null;
  isLoading: true | false;
  isAuthenticated: true | false;
};
export type Document = {
  _id: string;
  author: Partial<User>;
  collaborators: Array<Partial<User>>;
  createdAt: string;
  data: Object;
  title: string;
  updatedAt: string;
};
export type User = {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  avatar: string;
};
