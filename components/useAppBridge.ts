import { useGlobalContext, Participant, Like as AdicionaresLike, Chat as AdicionaresChat } from '../context/AdicionaresContext';
import { UserProfile, Like, Match, Message } from './transloveTypes';

export const mapParticipantToUserProfile = (p: Participant): UserProfile => {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    avatar_url: p.avatar,
    bio: p.bio || '',
    age: p.age || 30,
    city: p.city || 'Cognópolis, Foz',
    gender: p.specialty === 'Projeciologia' ? 'travesti' : 'admirador', // Dummy gender to fit translove filters
    is_premium: p.role === 'Epicon',
    is_verified: p.role !== 'Membro',
    is_online: p.isOnline || false,
    sponsored: p.contribution > 80,
    distance: 3,
    created_at: p.joinDate,
    desire_points: p.contribution,
    fetishes: p.projects || [],
    private_photos: [p.avatar],
    private_space_price: 15.00,
    is_creator_space_unlocked: true,
    specialty: p.specialty
  };
};

export const useAppBridge = (onNavigate?: (screen: string) => void) => {
  const context = useGlobalContext();

  const currentUser: UserProfile = {
    id: 'user-douglas',
    email: 'douglas@adicionares.com',
    name: 'Douglas Rocha',
    avatar_url: 'https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png',
    bio: 'Pesquisador da Consciência, focado em cosmoética.',
    age: 38,
    city: 'Cognópolis, Foz',
    gender: 'admirador',
    is_premium: true,
    is_verified: true,
    is_online: true,
    sponsored: false,
    created_at: new Date().toISOString()
  };

  const profiles = context.participants.map(mapParticipantToUserProfile);

  const likes: Like[] = context.likes.map(l => ({
    id: l.id,
    sender_id: l.senderId,
    receiver_id: l.receiverId,
    is_superlike: false,
    created_at: l.createdAt
  }));

  // Map Chats to Matches
  const matches: Match[] = context.chats.map(c => {
    const p = context.participants.find(part => part.id === c.partnerId);
    const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
    return {
      id: c.id,
      user1_id: 'user-douglas',
      user2_id: c.partnerId,
      created_at: new Date().toISOString(),
      profile: p ? mapParticipantToUserProfile(p) : undefined,
      last_message: lastMsg?.text || undefined,
      last_message_time: lastMsg?.time || undefined,
      unread_count: 0
    };
  });

  // Collect all messages from all chats
  const messages: Message[] = [];
  context.chats.forEach(c => {
    c.messages.forEach(m => {
      messages.push({
        id: m.id,
        match_id: c.id,
        sender_id: m.senderId,
        content: m.text,
        is_read: true,
        created_at: m.time
      });
    });
  });

  const sendLike = async (receiverId: string, isSuper: boolean) => {
    const res = await context.sendLike(receiverId, true);
    return res.isMatch;
  };

  const sendMessage = async (matchId: string, content: string, emoji?: string, imageUrl?: string) => {
    // Find partnerId from matchId
    const foundChat = context.chats.find(c => c.id === matchId);
    if (foundChat) {
      await context.sendDirectMessage(foundChat.partnerId, content);
      return true;
    }
    return false;
  };

  const navigateTo = (page: string) => {
    if (!onNavigate) return;
    if (page === 'home') {
      onNavigate('matches');
    } else if (page === 'vitrine') {
      onNavigate('grupo');
    } else if (page === 'matches') {
      onNavigate('chat'); // Navigation to matches list in ChatScreen
    } else {
      onNavigate(page);
    }
  };

  return {
    currentUser,
    profiles,
    likes,
    matches,
    messages,
    desirePoints: 150.00,
    unlockedPhotos: [] as string[],
    unlockedSpaces: [] as string[],
    isCreatorSpaceUnlocked: true,
    sendLike,
    sendMessage,
    navigateTo,
    earnPoints: (...args: any[]) => {},
    spendPoints: (...args: any[]) => true,
    unlockPhoto: (...args: any[]) => true,
    unlockSpace: (...args: any[]) => true,
    unlockCreatorSpace: (...args: any[]) => true,
    userGallery: [],
    addUserPhoto: () => {},
    updatePhotoPrice: () => {},
    removeUserPhoto: () => {},
    shortVideos: [],
    addShortVideo: () => {},
    likeShortVideo: () => {},
    salesLog: [],
    creatorBalance: 0,
    withdrawCreatorFunds: () => true,
    simulateVisitorUnlock: () => {},
    isConnected: true
  };
};
