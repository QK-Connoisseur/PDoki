/**
 * Sample header notifications shared by the member pages.
 *
 * Dev/test only — not production data. Replaces the inline copies that were
 * duplicated across Home, Profile, Store, Connect, and Promotions. Activity and
 * read metadata are illustrative; there is no persisted notification API yet.
 */
export const notifications = [
  {
    id: 4,
    actor: "Sora Nyx",
    action: "commented on your post.",
    text: "Sora Nyx commented on your post.",
    type: "comment",
    unread: true,
    group: "today",
    preview: "The colors in this are everything. More of this, please!",
    time: "2 minutes ago",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 1,
    actor: "Luna Bloom",
    action: "gave your post a Kokoro.",
    text: "Luna Bloom gave your post a Kokoro",
    type: "reaction",
    unread: true,
    group: "today",
    time: "15 minutes ago",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 2,
    actor: "Mika Rose",
    action: "started following you.",
    text: "Mika Rose started following you",
    type: "follow",
    unread: true,
    group: "today",
    time: "35 minutes ago",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 3,
    actor: "Airi Vale",
    action: "posted a new exclusive drop.",
    text: "Airi Vale posted a new exclusive drop",
    type: "drop",
    unread: true,
    group: "today",
    time: "1 hour ago",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 5,
    actor: "Mika Rose",
    action: "mentioned you in a comment.",
    text: "Mika Rose mentioned you in a comment.",
    type: "mention",
    unread: false,
    group: "earlier",
    preview: "This made me think of you!",
    time: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
  },
  {
    id: 6,
    actor: "Luna Bloom",
    action: "replied to your comment.",
    text: "Luna Bloom replied to your comment.",
    type: "comment",
    unread: false,
    group: "earlier",
    preview: "Thank you for being here. It means a lot.",
    time: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
];
