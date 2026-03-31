import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { chatApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ── Conversation List ──
function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Mis Conversaciones</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tienes conversaciones aun.</p>
            <Link to="/productos" className="text-sm font-semibold mt-2 inline-block" style={{ color: 'var(--gold)' }}>
              Explorar productos
            </Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className="w-full text-left p-4 border-b transition hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                background: conv.id === activeId ? 'var(--bg-card)' : 'transparent',
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-display text-sm font-semibold truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                  {conv.productName}
                </p>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{timeAgo(conv.createdAt)}</span>
              </div>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {conv.companyName} - {formatPrice(conv.productReferencePrice)}
              </p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                conv.status === 'Open' ? 'bg-emerald-mid/20 text-emerald-light' :
                conv.status === 'Negotiating' ? 'bg-gold-bright/20 text-gold-bright' :
                'bg-red-500/20 text-red-400'
              }`}>
                {conv.status === 'Open' ? 'Abierta' : conv.status === 'Negotiating' ? 'Negociando' : 'Cerrada'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Chat Window ──
function ChatWindow({ conversationId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await chatApi.getMessages(conversationId);
      setMessages(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await chatApi.sendMessage(conversationId, newMessage);
      setNewMessage('');
      loadMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    const price = parseFloat(offerPrice);
    if (!price || price <= 0) return;
    try {
      await chatApi.offerPrice(conversationId, price);
      setOfferPrice('');
      setShowOffer(false);
      loadMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAccept = async () => {
    try {
      await chatApi.acceptPrice(conversationId);
      loadMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await chatApi.rejectPrice(conversationId);
      loadMessages();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
          <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>Selecciona una conversacion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === userId;
            const isOffer = msg.messageType === 'PriceOffer';

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm px-4 py-3 ${
                  isOffer ? 'chat-bubble-offer' :
                  isMine ? 'chat-bubble-sent' : 'chat-bubble-received'
                }`}>
                  {!isMine && (
                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.senderUsername}</p>
                  )}
                  {isOffer ? (
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide font-semibold mb-1">Oferta de precio</p>
                      <p className="text-xl font-bold">{formatPrice(msg.offeredPrice)}</p>
                      {!isMine && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={handleAccept} className="flex-1 py-1.5 rounded-lg bg-white/20 text-xs font-semibold hover:bg-white/30 transition">
                            Aceptar
                          </button>
                          <button onClick={handleReject} className="flex-1 py-1.5 rounded-lg bg-black/10 text-xs font-semibold hover:bg-black/20 transition">
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/50' : ''}`} style={!isMine ? { color: 'var(--text-muted)' } : {}}>
                    {timeAgo(msg.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        {showOffer ? (
          <form onSubmit={handleOffer} className="flex gap-3">
            <input
              type="number"
              className="form-input flex-1"
              placeholder="Precio ofertado (COP)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              min="1"
            />
            <button type="submit" className="px-4 py-2 rounded-xl font-semibold text-sm transition" style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}>
              Ofertar
            </button>
            <button type="button" onClick={() => setShowOffer(false)} className="px-3 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)' }}>
              Cancelar
            </button>
          </form>
        ) : (
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowOffer(true)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition"
              style={{ background: 'var(--color-gold-bright)', color: '#1a1a1a' }}
              title="Ofertar precio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl font-semibold text-sm transition" style={{ background: 'var(--color-emerald-mid)', color: 'white' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Chat Page ──
export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    chatApi.getMyConversations()
      .then((res) => setConversations(res.data || []))
      .catch(() => {});
  }, [user, navigate]);

  const handleSelect = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen pt-16 flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-80 border-r flex-shrink-0 hidden md:block" style={{ borderColor: 'var(--border)' }}>
        <ConversationList conversations={conversations} activeId={conversationId} onSelect={handleSelect} />
      </div>

      {/* Chat */}
      <ChatWindow conversationId={conversationId} userId={user?.userId} />
    </div>
  );
}
