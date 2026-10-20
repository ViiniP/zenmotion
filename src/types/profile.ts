// Os valores ficam como texto enquanto são editados no formulário.
export type ProfileForm = {
  name: string;
  email: string;
  goal: string;
  duration: string;
};

export type ProfileErrors = {
  name?: string;
  email?: string;
  goal?: string;
  duration?: string;
};
