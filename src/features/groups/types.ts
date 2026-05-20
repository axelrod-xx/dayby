export type Group = {
  id: string;
  name: string;
  owner_id: string;
  timezone: string;
  member_limit: number;
  plan: 'free' | 'plus' | 'event' | 'org';
  monthly_highlight_enabled: boolean;
  download_enabled: boolean;
  status: 'active' | 'quiet' | 'archived' | 'memory_active' | 'dormant' | 'delete_scheduled' | 'deleted';
  last_posted_at: string | null;
  last_viewed_at: string | null;
  last_downloaded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
};

export type GroupWithMembership = Group & {
  member_role: GroupMember['role'];
};
