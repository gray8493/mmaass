export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Teams: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: undefined;
  TeamDetail: { teamId: string; teamName?: string };
  Chat: { teamId: string; teamName: string };
};
