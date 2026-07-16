export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  bio: string;
  age: number;
  city: string;
  gender: 'travesti' | 'admirador' | 'outro';
  instagram?: string;
  preferences?: string;
  is_premium: boolean;
  is_verified: boolean;
  is_online: boolean;
  last_seen?: string;
  sponsored: boolean;
  distance?: number;
  created_at: string;
  desire_points?: number;
  fetishes?: string[];
  private_photos?: string[];
  private_space_price?: number;
  is_creator_space_unlocked?: boolean;
  specialty?: string;
}

export interface Like {
  id: string;
  sender_id: string;
  receiver_id: string;
  is_superlike: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profile?: UserProfile;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  emoji?: string;
  is_read: boolean;
  created_at: string;
}
