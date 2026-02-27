export enum SearchCategory {
  EVENTS = 'events',
  PATHWAYS = 'pathways',
  DESIGNS = 'designs',
  TEAM_MEMBERS = 'team_members',
}

export interface SearchResultItem {
  uuid: string;
  name: string;
  category: SearchCategory;
  subtitle?: string;
}

export interface GlobalSearchResult {
  events: SearchResultItem[];
  pathways: SearchResultItem[];
  designs: SearchResultItem[];
  team_members: SearchResultItem[];
  total: number;
}

export interface RecentSearchItem {
  name: string;
  category: SearchCategory;
  route: string;
}
