import { useState, useRef, useEffect, useCallback } from "react";
import ChatAvatar from "./ChatAvatar";
import { MenuHeartIcon, STATUS_OPTIONS } from "./UserStatusSwitcher";

/* ─── Constants ──────────────────────────────────────────────────────────── */

const STORAGE_KEY = "pumdoki_active_chat_id";

const MOCK_MESSAGES = {
  1: [
    {
      id: 1,
      text: "Hey! Just wanted to say your content is amazing 💕",
      fromMe: false,
      time: "2:10 PM",
    },
    {
      id: 2,
      text: "That genuinely made my day, thank you so much! 🌸",
      fromMe: true,
      time: "2:12 PM",
    },
    {
      id: 3,
      text: "When's your next drop? I'm so excited!",
      fromMe: false,
      time: "2:14 PM",
    },
    {
      id: 4,
      text: "This weekend! Something really special 🎀 Stay tuned",
      fromMe: true,
      time: "2:16 PM",
    },
    { id: 5, text: "Thanks for the support!", fromMe: false, time: "2:18 PM" },
  ],
  2: [
    {
      id: 1,
      text: "Are you streaming tonight?",
      fromMe: true,
      time: "6:40 PM",
    },
    {
      id: 2,
      text: "Yes! 9pm as always 🎵 Don't miss it",
      fromMe: false,
      time: "6:42 PM",
    },
    { id: 3, text: "I'll be there 🙌", fromMe: true, time: "6:44 PM" },
    {
      id: 4,
      text: "See you on the stream tonight!",
      fromMe: false,
      time: "6:50 PM",
    },
  ],
  3: [
    {
      id: 1,
      text: "Your photography is absolutely stunning ✨",
      fromMe: true,
      time: "10:00 AM",
    },
    {
      id: 2,
      text: "Thank you so much! I put so much love into every shot 📸",
      fromMe: false,
      time: "10:04 AM",
    },
    {
      id: 3,
      text: "New content coming soon 🌙",
      fromMe: false,
      time: "10:07 AM",
    },
  ],
  4: [
    { id: 1, text: "I love your work!", fromMe: true, time: "3:18 PM" },
    {
      id: 2,
      text: "omg that is so sweet!! 😍 You're the best",
      fromMe: false,
      time: "3:20 PM",
    },
    { id: 3, text: "Loved your comment!", fromMe: false, time: "3:22 PM" },
  ],
  5: [
    {
      id: 1,
      text: "The beach content has been incredible lately 🌊",
      fromMe: true,
      time: "9:00 AM",
    },
    {
      id: 2,
      text: "Thank you! The ocean always inspires me 💙",
      fromMe: false,
      time: "9:04 AM",
    },
    { id: 3, text: "Check out my latest post", fromMe: false, time: "9:10 AM" },
  ],
  6: [
    {
      id: 1,
      text: "That last set you posted was fire 🔥",
      fromMe: false,
      time: "8:25 AM",
    },
    {
      id: 2,
      text: "Thank you!! Working on something even better 💜",
      fromMe: true,
      time: "8:28 AM",
    },
    { id: 3, text: "When's the next drop?", fromMe: false, time: "8:35 AM" },
  ],
};

/* ─── ChatSidebar ────────────────────────────────────────────────────────── */

export default function ChatSidebar({ contacts = [] }) {
  /* Animation state: chatMounted controls DOM presence; chatVisible drives CSS transitions */
  const [chatMounted, setChatMounted] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const [activeChatId, setActiveChatId] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? parseInt(raw, 10) : NaN;
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  });

  /* Tracks which contacts the user has opened so we can clear their unread counts */
  const [readIds, setReadIds] = useState(() => new Set());

  const [chatTooltip, setChatTooltip] = useState(null);
  const [chatTooltipPos, setChatTooltipPos] = useState({ top: 0, right: 0 });
  const [messageInput, setMessageInput] = useState("");
  const [localMessages, setLocalMessages] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const hoverTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimerRef = useRef(null);
  const openTokenRef = useRef(0);
  /* Read once at mount — sufficient for a single-page session */
  const reducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  /* Contacts with in-session unread state applied */
  const localContacts = contacts.map((c) => ({
    ...c,
    unread: readIds.has(c.id) ? 0 : c.unread,
  }));

  /* Persist activeChatId */
  useEffect(() => {
    try {
      if (activeChatId != null)
        localStorage.setItem(STORAGE_KEY, String(activeChatId));
    } catch {}
  }, [activeChatId]);

  /* ESC to close */
  useEffect(() => {
    if (!chatMounted) return;
    const handler = (e) => {
      if (e.key === "Escape") closeChat();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [chatMounted]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scroll to bottom when switching contacts or sending */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, localMessages]);

  /* Focus composer when chat becomes visible or contact changes */
  useEffect(() => {
    if (chatVisible) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [chatVisible, activeChatId]);

  /* Trigger exit transition then unmount */
  const closeChat = useCallback(() => {
    openTokenRef.current++;
    clearTimeout(closeTimerRef.current);
    setChatVisible(false);
    if (reducedMotion.current) {
      setChatMounted(false);
    } else {
      closeTimerRef.current = setTimeout(() => setChatMounted(false), 300);
    }
  }, []);

  /* Mount panel then trigger enter transition in the next paint */
  const openChat = useCallback(
    (preferredId) => {
      clearTimeout(closeTimerRef.current);
      const valid =
        contacts.find((c) => c.id === preferredId)?.id ??
        contacts[0]?.id ??
        null;
      setActiveChatId(valid);
      if (valid != null) {
        setReadIds((prev) =>
          prev.has(valid) ? prev : new Set([...prev, valid])
        );
      }
      setChatMounted(true);
      if (reducedMotion.current) {
        setChatVisible(true);
        return;
      }
      const token = ++openTokenRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (openTokenRef.current === token) setChatVisible(true);
        });
      });
    },
    [contacts]
  );

  const handleExpandToggle = () => {
    if (chatMounted) closeChat();
    else openChat(activeChatId);
  };

  /* Select a contact from the list and mark it read */
  const handleSelectContact = (id) => {
    setActiveChatId(id);
    setReadIds((prev) => (prev.has(id) ? prev : new Set([...prev, id])));
  };

  const handleSend = () => {
    if (!messageInput.trim() || activeChatId == null) return;
    const msg = {
      id: Date.now(),
      text: messageInput.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLocalMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), msg],
    }));
    setMessageInput("");
  };

  const activeContact =
    localContacts.find((c) => c.id === activeChatId) ?? null;

  const allMessages = [
    ...(MOCK_MESSAGES[activeChatId] ?? []),
    ...(localMessages[activeChatId] ?? []),
  ];

  const filteredContacts = localContacts
    .filter((c) => activeTab !== "unread" || c.unread > 0)
    .filter(
      (c) =>
        !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  /* ─── Render ──────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Always-in-flow strip (holds layout width, shows minimised avatars) */}
      <aside
        className="member-glass-rail member-glass-rail-right hidden md:flex flex-col shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-l border-pink-100 bg-white z-30 w-[82px]"
        aria-label="Chat sidebar"
      >
        {/* Expand / collapse toggle */}
        <button
          onClick={handleExpandToggle}
          className="member-chat-expand-toggle flex h-10 w-full items-center justify-center border-b border-pink-50 text-[#8c6d7f] transition hover:bg-pink-50 hover:text-[#df5f97] cursor-pointer"
          aria-label={chatVisible ? "Collapse inbox" : "Expand inbox"}
          aria-expanded={chatVisible}
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-transform duration-300 ${chatVisible ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Minimised avatar rail */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <div className="flex flex-col items-center gap-7 py-4">
            {localContacts.map((contact) => (
              <button
                key={contact.id}
                className="relative cursor-pointer"
                onClick={() => {
                  clearTimeout(hoverTimer.current);
                  setChatTooltip(null);
                  openChat(contact.id);
                }}
                aria-label={`Chat with ${contact.name}`}
                onMouseEnter={(e) => {
                  clearTimeout(hoverTimer.current);
                  const rect = e.currentTarget.getBoundingClientRect();
                  hoverTimer.current = setTimeout(() => {
                    setChatTooltip(contact);
                    setChatTooltipPos({
                      top: rect.top + rect.height / 2,
                      right: window.innerWidth - rect.left + 10,
                    });
                  }, 200);
                }}
                onMouseLeave={() => {
                  clearTimeout(hoverTimer.current);
                  setChatTooltip(null);
                }}
              >
                <ChatAvatar
                  src={contact.avatar}
                  alt={contact.name}
                  size={56}
                  status={contact.status}
                  unreadCount={contact.unread}
                  decoration={contact.avatarDecoration}
                  showStatusTooltip={false}
                />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Expanded overlay ─────────────────────────────────────────────── */}
      {chatMounted && (
        <>
          {/* Full-viewport dim backdrop — covers header + left nav */}
          <div
            className={`member-chat-backdrop fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ease-in-out ${
              chatVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeChat}
            aria-hidden="true"
          />

          {/* Two-pane chat panel */}
          <div
            className={`member-glass-chat-panel fixed right-0 bottom-0 z-[65] flex bg-white border-l border-pink-100 shadow-2xl transition-transform duration-300 ease-in-out ${
              chatVisible ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ top: "4rem", width: "min(900px, calc(100vw - 1rem))" }}
            role="dialog"
            aria-label="Messages"
            aria-modal="true"
          >
            {/* ── LEFT PANE: contact list ─────────────────────────────── */}
            <div className="w-[272px] shrink-0 flex flex-col border-r border-pink-100">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-pink-50">
                <h2 className="text-sm font-semibold text-[#241a22]">
                  Messages
                </h2>
                <button
                  onClick={closeChat}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#8c6d7f] hover:bg-pink-50 hover:text-[#df5f97] transition cursor-pointer"
                  aria-label="Close messages"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-pink-50">
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#c59aae] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations…"
                    className="w-full rounded-full border border-pink-100 bg-[#fffafc] pl-8 pr-3 py-1.5 text-xs outline-none placeholder:text-[#c59aae] focus:border-pink-300"
                    aria-label="Search conversations"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div
                className="flex border-b border-pink-50"
                role="tablist"
                aria-label="Message filters"
              >
                {["all", "unread"].map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-xs font-medium text-center transition cursor-pointer relative ${
                      activeTab === tab
                        ? "text-[#241a22]"
                        : "text-[#b89aa8] hover:text-[#8c6d7f]"
                    }`}
                  >
                    {tab === "all" ? "All" : "Unread"}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Contact list */}
              <div
                className="flex-1 overflow-y-auto hide-scrollbar"
                role="tabpanel"
              >
                {filteredContacts.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-xs text-[#b89aa8]">
                    {searchQuery ? "No results" : "No unread messages"}
                  </div>
                ) : (
                  filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-pink-50/60 cursor-pointer ${
                        contact.id === activeChatId
                          ? "bg-pink-50 border-r-2 border-[#f472b6]"
                          : "border-r-2 border-transparent"
                      }`}
                      aria-pressed={contact.id === activeChatId}
                      aria-label={`Open conversation with ${contact.name}`}
                    >
                      <ChatAvatar
                        src={contact.avatar}
                        alt={contact.name}
                        size={42}
                        status={contact.status}
                        unreadCount={contact.unread}
                        decoration={contact.avatarDecoration}
                        showStatusTooltip={false}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-sm truncate ${contact.unread > 0 ? "font-semibold text-[#241a22]" : "font-medium text-[#241a22]"}`}
                          >
                            {contact.name}
                          </p>
                          <span className="text-[10px] text-[#b89aa8] shrink-0">
                            {contact.time}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#8c6d7f] truncate">
                          {contact.fromMe
                            ? `You: ${contact.lastMessage}`
                            : contact.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── RIGHT PANE: conversation ────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
              {activeContact ? (
                <>
                  {/* Conversation header — status heart shown only in text row, not on avatar */}
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-pink-100 bg-white shrink-0">
                    <ChatAvatar
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      size={40}
                      status={activeContact.status}
                      decoration={activeContact.avatarDecoration}
                      showStatusTooltip={false}
                      showStatus={false}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#241a22] truncate">
                        {activeContact.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MenuHeartIcon
                          status={activeContact.status}
                          size={12}
                        />
                        <span className="text-[11px] text-[#8c6d7f]">
                          {STATUS_OPTIONS.find(
                            (s) => s.id === activeContact.status
                          )?.label ?? "Online"}
                        </span>
                      </div>
                    </div>

                    {/* Doki Rank quick action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="flex items-center gap-1.5 rounded-full border border-pink-200 px-3 py-1.5 text-xs font-semibold text-[#8c6d7f] hover:bg-pink-50 hover:text-[#df5f97] hover:border-pink-300 transition cursor-pointer"
                        aria-label="View Doki Rank for this creator"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M8 2l1.6 3.2 3.5.5-2.55 2.48.6 3.5L8 10l-3.15 1.68.6-3.5L2.9 5.7l3.5-.5z" />
                        </svg>
                        Doki Rank
                      </button>
                    </div>
                  </div>

                  {/* Message history */}
                  <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5 space-y-4 bg-[#fffafc]">
                    {allMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${msg.fromMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!msg.fromMe && (
                          <div className="shrink-0 mb-4">
                            <ChatAvatar
                              src={activeContact.avatar}
                              alt={activeContact.name}
                              size={26}
                              status={activeContact.status}
                              showStatusTooltip={false}
                              showStatus={false}
                            />
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-0.5 ${msg.fromMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              msg.fromMe
                                ? "bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white rounded-br-sm shadow-sm shadow-pink-200/50"
                                : "bg-white border border-pink-100 text-[#241a22] rounded-bl-sm shadow-sm"
                            }`}
                            style={{ maxWidth: "min(300px, 68%)" }}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[10px] text-[#c4a8b8] px-1">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Composer */}
                  <div className="px-4 pt-2.5 pb-3 border-t border-pink-100 bg-white shrink-0">
                    {/* Action toolbar: media attach, gift, and Tip Veso */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#b89aa8] hover:bg-pink-50 hover:text-[#df5f97] transition cursor-pointer"
                        aria-label="Attach media"
                        title="Attach media"
                        onClick={() => {}}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </button>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[#b89aa8] hover:bg-pink-50 hover:text-[#df5f97] transition cursor-pointer"
                        aria-label="Send a gift"
                        title="Send a gift"
                        onClick={() => {}}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 12 20 22 4 22 4 12" />
                          <rect x="2" y="7" width="20" height="5" />
                          <line x1="12" y1="22" x2="12" y2="7" />
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                        </svg>
                      </button>
                      <div className="flex-1" />
                      <button
                        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:brightness-105 active:scale-95 cursor-pointer"
                        style={{
                          background: "linear-gradient(90deg,#f5b63b,#f9c76a)",
                          color: "#2B1A10",
                        }}
                        aria-label={`Tip Veso to ${activeContact.name}`}
                        onClick={() => {}}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className="w-3.5 h-3.5"
                          fill="none"
                        >
                          <path
                            d="M8 13c-1.2-.85-3.2-2.1-4.4-3.6C2.2 8 2.2 6.8 3.8 6c.85-.45 1.8-.22 2.4.5.2.23.3.52.3.8 0-.28.1-.57.3-.8.6-.72 1.55-.95 2.4-.5 1.6.8 1.6 2 .4 3.4C8.4 10.9 8 13 8 13z"
                            fill="#2B1A10"
                            opacity="0.75"
                          />
                        </svg>
                        Tip Veso
                      </button>
                    </div>

                    {/* Message input row */}
                    <div className="flex items-center gap-2.5">
                      <input
                        ref={inputRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={`Message ${activeContact.name}…`}
                        className="flex-1 rounded-full border border-pink-100 bg-[#fffafc] px-4 py-2.5 text-sm outline-none placeholder:text-[#c59aae] focus:border-pink-300 transition"
                        aria-label={`Message ${activeContact.name}`}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!messageInput.trim()}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#f9a8c8] to-[#f472b6] text-white transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-pink-200/50"
                        aria-label="Send message"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 translate-x-px"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#b89aa8] select-none">
                  <svg
                    viewBox="0 0 48 48"
                    className="w-12 h-12 opacity-25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M40 6H8a2 2 0 00-2 2v22a2 2 0 002 2h10l6 8 6-8h10a2 2 0 002-2V8a2 2 0 00-2-2z" />
                    <path d="M16 18h16M16 24h10" />
                  </svg>
                  <p className="text-sm">Select a conversation to start</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Hover tooltip (collapsed mode only) ──────────────────────────── */}
      {chatTooltip && !chatMounted && (
        <div
          className="fixed z-[70] pointer-events-none"
          style={{
            top: chatTooltipPos.top,
            right: chatTooltipPos.right,
            transform: "translateY(-50%)",
          }}
        >
          <div className="bg-white border border-pink-100 rounded-xl shadow-lg px-3 py-2 w-44">
            <p className="text-xs font-semibold text-[#241a22] truncate">
              {chatTooltip.name}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8c6d7f] truncate">
              {chatTooltip.fromMe
                ? `You: ${chatTooltip.lastMessage}`
                : chatTooltip.lastMessage}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-pink-50">
              <MenuHeartIcon status={chatTooltip.status} size={12} />
              <span className="text-[11px] text-[#8c6d7f]">
                {STATUS_OPTIONS.find((s) => s.id === chatTooltip.status)
                  ?.label ?? "Online"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
