export interface Friend {
  id: string;
  name: string;
  color?: string;
  profilePicture?: string; // Base64 encoded image or URI
}

export interface SockColor {
  id: string;
  name: string;
  hexCode: string;
  isDefault?: boolean;
}

export interface SockGroup {
  id: string;
  name: string;
  friends: Friend[];
  colors: SockColor[];
  groupPicture?: string; // Base64 encoded image or URI
  createdAt: Date;
}

export interface DailyColor {
  date: string; // YYYY-MM-DD format
  color: SockColor;
}
