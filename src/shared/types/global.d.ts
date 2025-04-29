// Use type safe message keys with `next-intl`
type Messages = typeof import('../locales/en.json');

// eslint-disable-next-line
declare interface IntlMessages extends Messages {}

// Define server action response type
export type ServerActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};
