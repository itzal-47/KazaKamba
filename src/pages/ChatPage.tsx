import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Send, User, ArrowLeft, MoreVertical, Phone, Image, ShoppingCart, Wrench, Home as HomeIcon, ChevronRight, X, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import type { Chat, Message, Listing } from '../types';
import { getChats, getMessages, sendMessage, getCurrentUser, getProfile, getListingById, createListing } from '../lib/api';
import { supabase } from '../lib/supabase';
import { formatPrice, optimizeImageUrl, getCategoryImage, timeAgo } from '../lib/utils';

function getListingIcon(tipo: string) {
  switch (tipo) {
    case 'mercado': return ShoppingCart;
    case 'casa': return HomeIcon;
    case 'servico': return Wrench;
    default: return Image;
  }
}

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingIdParam = searchParams.get('listing');

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = async () => {
    setLoading(true);
    try {
      const data = await getChats();
      setChats(data);
    } catch (err) {
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUserId(user.id);
        getProfile(user.id).then(setCurrentProfile);
      }
    });
    loadChats();
  }, []);

  useEffect(() => {
    if (listingIdParam && chats.length > 0) {
      const chatWithListing = chats.find(c => c.listing_id === listingIdParam);
      if (chatWithListing) {
        setSelectedChat(chatWithListing);
      }
    }
  }, [listingIdParam, chats]);

  useEffect(() => {
    if (selectedChat) {
      setLoadingMessages(true);
      getMessages(selectedChat.id)
        .then(setMessages)
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));

      // Subscribe to new messages in this chat
      const channel = supabase
        .channel(`chat:${selectedChat.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${selectedChat.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            // Only add if not already added optimistically
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              // Fetch the message with profile data
              getMessages(selectedChat.id).then((all) => {
                setMessages(all);
              });
              return prev;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChat]);

  // Subscribe to chats list updates
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('chats-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;

    const messageText = newMessage;
    const tempId = Date.now().toString();

    const tempMessage: Message = {
      id: tempId,
      chat_id: selectedChat.id,
      sender_id: currentUserId,
      receiver_id: selectedChat.participantes.find((p) => p !== currentUserId) || '',
      texto: messageText,
      lida: false,
      criado_em: new Date().toISOString(),
      sender: currentProfile,
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await sendMessage(selectedChat.id, tempMessage.receiver_id, messageText);
    } catch {
      // Rollback on failure - remove temp message and restore input
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(messageText);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.other_user?.nome?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile: Show chat or list
  if (selectedChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:hidden">
        <div className="sticky top-0 z-10 bg-background-card border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">{selectedChat.other_user?.nome?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <p className="text-white font-medium">{selectedChat.other_user?.nome || 'Utilizador'}</p>
                <p className="text-white/50 text-sm">{selectedChat.other_user?.bairro}</p>
              </div>
            </div>

            <button className="p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Context Card - Listing being discussed */}
        {selectedChat.listing && (
          <div className="bg-background-card/50 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src={optimizeImageUrl(selectedChat.listing.fotos_urls?.[0] || getCategoryImage('default'), false)}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-white font-medium text-sm line-clamp-1">{selectedChat.listing.titulo}</p>
                <p className="text-primary font-semibold text-sm">{formatPrice(selectedChat.listing.preco, selectedChat.listing.negociavel)}</p>
              </div>
              <Link
                to={`/listing/${selectedChat.listing.id}`}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => {
            const isMine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-md' : 'bg-white/10 text-white rounded-bl-md'}`}>
                  <p className="text-sm">{message.texto}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-white/50'}`}>{timeAgo(message.criado_em)}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-16 bg-background border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escrever mensagem..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
            />
            <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-3 rounded-xl bg-primary text-white hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop or mobile list
  return (
    <div className="min-h-screen bg-background py-8 md:py-0">
      <div className="max-w-5xl mx-auto px-4 md:px-0 md:flex md:min-h-[calc(100vh-120px)]">
        {/* Chat List */}
        <div className={`md:w-80 md:border-r md:border-white/10 ${selectedChat ? 'hidden md:block' : ''}`}>
          <div className="md:p-4">
            <div className="mb-6 px-4 md:px-0">
              <h1 className="text-2xl md:text-xl font-bold text-white mb-1">Chat</h1>
              <p className="text-white/60 text-sm">Conversas com outros utilizadores</p>
            </div>

            <div className="relative mb-4 px-4 md:px-0">
              <Search className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar conversas..."
                className="w-full pl-12 md:pl-10 pr-4 py-3 md:py-2 bg-white/5 border border-white/10 rounded-xl md:rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              {loading ? (
                <LoadingSkeleton type="chat" count={5} />
              ) : filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 md:px-3 md:py-2.5 text-left transition-all ${
                      selectedChat?.id === chat.id
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg md:text-sm">{chat.other_user?.nome?.charAt(0) || 'U'}</span>
                        </div>
                      {chat.listing && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background-card flex items-center justify-center">
                          {(() => {
                            const Icon = getListingIcon(chat.listing.tipo);
                            return <Icon className="w-3 h-3 text-primary" />;
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">{chat.other_user?.nome}</p>
                        <span className="text-white/50 text-xs">{timeAgo(chat.ultimo_message_em || '')}</span>
                      </div>
                      <p className="text-white/60 text-xs truncate">{chat.ultimo_message}</p>
                    </div>
                  </div>
                </button>
              ))
              ) : (
                <EmptyState type="chats" />
              )}
            </div>
          </div>
        </div>

        {/* Chat View - Desktop */}
        <div className={`flex-1 flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{selectedChat.other_user?.nome?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedChat.other_user?.nome}</p>
                  <p className="text-white/50 text-sm">{selectedChat.other_user?.bairro}</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/5 text-white/70">
                  <Phone className="w-5 h-5" />
                </button>
              </div>

              {/* Context Card */}
              {selectedChat.listing && (
                <div className="px-4 py-3 bg-background-card/50 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={optimizeImageUrl(selectedChat.listing.fotos_urls?.[0] || getCategoryImage('default'), false)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white/80 text-sm font-medium line-clamp-1">{selectedChat.listing.titulo}</p>
                      <p className="text-primary font-semibold text-sm">{formatPrice(selectedChat.listing.preco, selectedChat.listing.negociavel)}</p>
                    </div>
                    <Link
                      to={`/listing/${selectedChat.listing.id}`}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((message) => {
                  const isMine = message.sender_id === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-md' : 'bg-white/10 text-white rounded-bl-md'}`}>
                        <p className="text-sm">{message.texto}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-white/50'}`}>{timeAgo(message.criado_em)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escrever mensagem..."
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-50">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white/20" />
                </div>
                <p className="text-white/60">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
