"use client";

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, Paperclip, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

type ChatMessage = {
  role: 'user' | 'model';
  parts: any;
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, type: string, data: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(',')[1];
      setAttachedFile({
        name: file.name,
        type: file.type,
        data: base64String
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    let parts: any = input.trim();
    if (attachedFile) {
      parts = [];
      if (input.trim()) parts.push(input.trim());
      parts.push({
        inline_data: {
          mime_type: attachedFile.type,
          data: attachedFile.data
        }
      });
    }

    const userMessage: ChatMessage = { role: 'user', parts: parts };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setMessages([...newMessages, { role: 'model', parts: data.reply }]);
      } else {
        throw new Error(data.detail || data.message || 'Error desconocido');
      }
    } catch (error: any) {
      toast.error('Error al comunicarse con el asistente: ' + error.message);
      setMessages([...newMessages, { role: 'model', parts: 'âŒ Lo siento, ha ocurrido un error al conectar con mis sistemas. Por favor, inténtalo de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] flex flex-col bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Bot size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)] text-sm">Asistente Cuaderno FP</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Respuestas generadas por IA</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-md hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-[var(--muted-foreground)] opacity-70">
                  <Bot size={40} />
                  <p className="text-sm">Â¡Hola! Soy tu asistente virtual.<br/>Pregúntame sobre la aplicación o dudas de programación didáctica.</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)]'}`}>
                    {Array.isArray(msg.parts) ? (
                      <div className="flex flex-col gap-2">
                        {msg.parts.map((p: any, i: number) => {
                          if (typeof p === 'string') return <span key={i}>{p}</span>;
                          if (p.inline_data) return (
                            <div key={i} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs" title="Archivo adjunto enviado a la IA">
                              <FileText size={14} className="text-blue-400"/>
                              <span>Adjunto enviado</span>
                            </div>
                          );
                          return null;
                        })}
                      </div>
                    ) : (
                      msg.parts
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-400" />
                    <span className="text-sm text-[var(--muted-foreground)]">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[var(--glass-border)] bg-black/20">
              {attachedFile && (
                <div className="mb-2 flex items-center justify-between bg-[var(--background)] p-2 rounded-lg border border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground)] overflow-hidden">
                    <FileText size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{attachedFile.name}</span>
                  </div>
                  <button onClick={() => setAttachedFile(null)} className="text-[var(--muted-foreground)] hover:text-red-400 p-1 rounded-md transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex relative items-end gap-2">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-[var(--background)] border border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors h-[44px] flex items-center justify-center"
                  title="Adjuntar PDF o Imagen"
                >
                  <Paperclip size={18} />
                </button>
                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-[var(--background)] border border-[var(--glass-border)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none max-h-32"
                    rows={1}
                    style={{ minHeight: '44px' }}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && !attachedFile) || isLoading}
                    className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center z-50 hover:shadow-xl hover:shadow-emerald-500/40 transition-shadow"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </>
  );
};

