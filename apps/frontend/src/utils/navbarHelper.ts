import { RouteEnum } from '@src/constants/route.enum';
import { UserTypeIdEnum } from '@src/shared/types/userTypes';

export type TLink = {
  name: string;
  link: string;
  isExtended?: boolean;
  exclude?: UserTypeIdEnum[];
};

export const menuItems: TLink[] = [
  {
    name: 'My Profile',
    link: RouteEnum.PROFILE_SETTINGS,
    exclude: [],
  },
  {
    name: 'Account Settings',
    link: RouteEnum.ACCOUNT_SETTINGS,
    exclude: [],
  },
  {
    name: 'Event Settings',
    link: RouteEnum.EVENT_SETTINGS,
    exclude: [],
  },
  {
    name: 'Team',
    link: RouteEnum.TEAM,
    exclude: [],
  },
];
