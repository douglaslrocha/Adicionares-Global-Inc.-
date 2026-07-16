import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';

import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

// --- Interfaces ---
interface FeedEditorProps {
    onSubmit: (content: string, audioData?: { duration: number }) => void;
    userAvatar?: string;
    placeholder?: string;
    focusTrigger?: number; // Prop para forçar foco
}

const Icon = ({ name, className = "" }: { name: string, className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// --- Audio Component & Extension ---

const AudioComponent = (props: any) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Toggle play state
    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    // Stop playing when unloaded
    useEffect(() => {
        return () => setIsPlaying(false);
    }, []);

    return (
        <NodeViewWrapper className="my-2">
            <div className="flex flex-row items-center gap-2 md:gap-4 p-2 md:p-3 bg-gradient-to-r from-red-700 to-red-900 rounded-[18px] w-full max-w-[95%] md:max-w-sm select-none transition-all hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800 backdrop-blur-md overflow-hidden flex-nowrap mx-auto border border-white/10 shadow-lg shadow-black/30">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    type="button"
                    className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Icon name={isPlaying ? "pause" : "play_arrow"} className="text-[18px] md:text-[24px]" />
                </button>

                {/* Waveform Visualization & Duration */}
                <div className="flex-1 flex flex-row items-center gap-1.5 min-w-0 overflow-hidden">
                    <div className="flex flex-row items-center gap-[2px] md:gap-[3px] h-6 md:h-8 items-end justify-start flex-1">
                        {/* More waves for fuller look, closer to timer */}
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-[3px] bg-white/60 rounded-full transition-all duration-300 ${isPlaying ? 'animate-audio-wave !bg-white' : ''} ${i > 14 ? 'hidden sm:block' : ''}`}
                                style={{
                                    height: isPlaying ? 'auto' : `${4 + Math.random() * 12}px`,
                                    animationDelay: `${i * 0.05}s`,
                                    minHeight: isPlaying ? '4px' : undefined,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] md:text-[12px] font-medium text-white/90 whitespace-nowrap flex-shrink-0 mb-[-2px]">
                        {props.node.attrs.duration || '0:00'}
                    </span>
                </div>

                {/* Delete Button */}
                <button
                    onClick={props.deleteNode}
                    type="button"
                    className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-white/5 rounded-full transition-all"
                    title="Excluir áudio"
                >
                    <Icon name="close" className="text-[18px] md:text-[20px]" />
                </button>
            </div>
        </NodeViewWrapper>
    );
};

const AudioExtension = Node.create({
    name: 'audioComponent',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            duration: {
                default: '0:00',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'audio-component',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['audio-component', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return ReactNodeViewRenderer(AudioComponent)
    },
});

const ImageUploadButton = ({ editor }: { editor: any }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && editor) {
            const url = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: url }).run();
        }
        if (event.target) event.target.value = '';
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-500 hover:text-white transition-colors"
                title="Imagem"
            >
                <Icon name="image" className="text-[22px]" />
            </button>
        </>
    );
};

const EmojiPickerButton = ({ onClick, isActive }: { onClick: () => void, isActive: boolean }) => {
    return (
        <button
            onClick={onClick}
            className={`transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white'}`}
            title="Emoji"
        >
            <Icon name="sentiment_satisfied" className="text-[22px]" />
        </button>
    );
};

const FeedEditor: React.FC<FeedEditorProps> = ({ onSubmit, placeholder, focusTrigger }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Ref to ignore focus events triggered by emoji insertion
    const ignoreFocusTrigger = React.useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Escreva algo...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-500 before:float-left before:pointer-events-none',
            }),
            AudioExtension, // Add custom extension
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none w-full min-w-0 bg-transparent border-none outline-none ring-0 focus:ring-0 text-gray-200 text-base px-2 leading-6 font-medium break-words py-2 min-h-[40px] max-h-[300px] overflow-y-auto no-scrollbar',
            },
        },
        onFocus: () => {
            setIsExpanded(true);
            // Only close picker if focus is NOT coming from an emoji insertion
            if (!ignoreFocusTrigger.current) {
                setShowEmojiPicker(false);
                setShowGifPicker(false);
            }
        },
        onBlur: ({ editor }) => {
            if (editor.isEmpty) setIsExpanded(false);
        },
    });

    // Focus Effect
    useEffect(() => {
        if (focusTrigger && editor) {
            editor.commands.focus();
        }
    }, [focusTrigger, editor]);

    // Cleanup editor on unmount
    useEffect(() => {
        return () => {
            if (editor) editor.destroy();
        }
    }, [editor]);

    // FORCE BLUR ON CATEGORY BUTTONS TO KILL BLUE FOCUS RING
    useEffect(() => {
        if (!showEmojiPicker) return;

        const handleCategoryClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if clicked element is a category button
            const btn = target.closest('button.epr-cat-btn');
            if (btn) {
                // Force blur immediately to prevent focus retention
                requestAnimationFrame(() => {
                    (btn as HTMLButtonElement).blur();
                });
            }
        };

        // Attach to document with capture phase to ensure we catch it
        document.addEventListener('click', handleCategoryClick, true);

        return () => {
            document.removeEventListener('click', handleCategoryClick, true);
        };
    }, [showEmojiPicker]);

    // CLICK OUTSIDE LISTENER: FECHAR PICKERS
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Fechar apenas se estiverem abertos
                if (showEmojiPicker) setShowEmojiPicker(false);
                if (showGifPicker) setShowGifPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, showGifPicker]);

    // TIMER LOGIC FOR AUDIO RECORDING
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartRecording = () => {
        setIsRecording(true);
        setIsExpanded(true); // Ensure container is expanded
        setShowToolbar(false);
        setShowEmojiPicker(false);
        setShowGifPicker(false);
    };

    const handleCancelRecording = () => {
        setIsRecording(false);
        setRecordingDuration(0);
    };

    const handleSendAudio = () => {
        if (editor) {
            const audioDuration = formatTime(recordingDuration);

            // Insert Custom Audio Node
            editor.chain().focus().insertContent({
                type: 'audioComponent',
                attrs: {
                    duration: audioDuration
                }
            }).run();

            setIsRecording(false);
            setRecordingDuration(0);
            setIsExpanded(true);
        }
    };

    const handleSubmit = () => {
        if (!editor || editor.isEmpty) return;

        // Check for audio node and extract duration
        const json = editor.getJSON();
        const audioNode = json.content?.find((n: any) => n.type === 'audioComponent');
        let audioData = undefined;

        if (audioNode) {
            const durationStr = audioNode.attrs?.duration || "0:00";
            const [mins, secs] = durationStr.split(':').map(Number);
            const totalSeconds = (mins * 60) + secs;
            audioData = { duration: totalSeconds };
        }

        // Get HTML content
        // Note: The <audio-component> tag will be in the HTML. 
        // FeedScreen will render it as hidden/ignored via CSS or just display the PostAudioPlayer based on audioData.
        const html = editor.getHTML();
        onSubmit(html, audioData);

        // Reset
        editor.commands.clearContent();
        setIsExpanded(false);
        setShowToolbar(false);
        setShowEmojiPicker(false);
        setShowGifPicker(false);
        setIsRecording(false);
        setRecordingDuration(0);
    };

    const addImage = () => {
        const url = window.prompt('URL da Imagem:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const setLink = () => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('URL do Link:', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const toggleEmojiPicker = () => {
        if (!showEmojiPicker) {
            // Opening: Blur editor to ensure keyboard closes
            editor?.commands.blur();
            setShowEmojiPicker(true);
            setShowGifPicker(false);
        } else {
            // Closing
            setShowEmojiPicker(false);
        }
    };

    const toggleGifPicker = () => {
        if (!showGifPicker) {
            editor?.commands.blur();
            setShowGifPicker(true);
            setShowEmojiPicker(false);
        } else {
            setShowGifPicker(false);
        }
    };

    const mockGifs = [
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXN6bnZ4cWZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGw4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamR6bnZ4cWZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGw4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlHFRbmaZtBRhXG/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6bnZ4cWZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGw4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMHxhOfscxPfIfm/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnR6bnZ4cWZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGw4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRv0ThflsHCqDrG/giphy.gif",
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzR6bnZ4cWZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGZ5Z3l5aGw4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6Ub3HmglIbdbk3sI/giphy.gif"
    ];

    const onGifClick = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const onEmojiClick = (emojiData: any) => {
        if (editor) {
            // Flag to ignore the subsequent focus event so picker stays open
            ignoreFocusTrigger.current = true;

            // Insert the emoji
            editor.commands.insertContent(emojiData.emoji);

            // FORCE BLUR again to ensure keyboard stays down
            editor.commands.blur();

            // Reset flag after a short delay
            setTimeout(() => {
                ignoreFocusTrigger.current = false;
            }, 100);
        }
    };

    const switchToKeyboard = () => {
        setShowEmojiPicker(false);
        editor?.commands.focus(); // Force focus back to editor to open keyboard
    };

    const isActive = isExpanded || (editor && !editor.isEmpty);

    // Dynamic layout adjustment
    return (
        <div ref={containerRef} className="w-[99.5%] mx-auto lg:w-full lg:max-w-4xl transition-all duration-300 relative">
            {/* CONTAINER PAI (BORDA) */}
            <div
                className={`relative w-full p-[2px] bg-gradient-to-tr from-blue-600 via-purple-500 to-orange-500 transition-all duration-300 ${isActive ? 'animate-gradient-xy shadow-glow-blue' : 'opacity-90'}`}
                style={{ borderRadius: '20px' }}
            >
                <div
                    className="relative w-full bg-[#0A0A0A] flex flex-col shadow-inner overflow-hidden"
                    style={{ borderRadius: '18px' }}
                >
                    {/* LINHA DE INPUT */}
                    {/* WRAPPER FLEX VERTICAL PARA EDITOR + GRAVAÇÃO */}
                    <div className="flex flex-col w-full">
                        {/* LINHA PRINCIPAL (Editor + Botões Padrão) */}
                        <div className="flex gap-2 p-2 items-end min-h-[50px]">

                            {/* Botão (+) Toggle Toolbar (Oculta ao gravar para limpar visual) */}
                            {!isRecording && (
                                <button
                                    onClick={() => setShowToolbar(!showToolbar)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5 ${showToolbar ? 'bg-white/20 text-white rotate-45' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                >
                                    <Icon name="add" className="text-[20px]" />
                                </button>
                            )}

                            {/* TIPTAP EDITOR CONTENT - SEMPRE VISÍVEL */}
                            <div className="flex-1 w-full min-w-0">
                                <EditorContent editor={editor} />
                            </div>

                            {/* Botões de Ação (Mic/Send) - Somente se NÃO estiver gravando */}
                            {!isRecording && (
                                isActive ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-glow-blue shrink-0 active:scale-95 mb-0.5"
                                    >
                                        <Icon name="send" className="text-[18px]" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStartRecording}
                                        className="w-9 h-9 rounded-full hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0 mb-0.5"
                                    >
                                        <Icon name="mic" className="text-[20px]" />
                                    </button>
                                )
                            )}
                        </div>

                        {/* UI DE GRAVAÇÃO - BARRA INFERIOR (Apenas quando isRecording) */}
                        {isRecording && (
                            <div className="flex items-center justify-between p-2 pl-3 animate-fade-in border-t border-white/5 bg-red-500/5">
                                {/* Cancel Button */}
                                <button
                                    onClick={handleCancelRecording}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors group"
                                    title="Cancelar"
                                >
                                    <Icon name="close" className="text-[24px] group-hover:scale-110 transition-transform" />
                                </button>

                                {/* Timer & Waveform */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-400 font-mono font-medium text-sm w-[40px]">
                                            {formatTime(recordingDuration)}
                                        </span>
                                    </div>

                                    {/* Simulated Waveform */}
                                    <div className="flex items-center gap-[3px] h-5">
                                        {[...Array(16)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-[3px] bg-red-500 rounded-full animate-audio-wave"
                                                style={{
                                                    height: `${Math.max(4, Math.random() * 16)}px`,
                                                    animationDelay: `${i * 0.05}s`,
                                                    opacity: 0.6 + (Math.random() * 0.4)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Send Audio Button (Insere áudio no editor) */}
                                <button
                                    onClick={handleSendAudio}
                                    className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-glow-red shrink-0 active:scale-95 mb-0.5"
                                    title="Inserir áudio"
                                >
                                    <Icon name="arrow_upward" className="text-[20px]" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Toolbar RICA */}
                    {showToolbar && editor && (
                        <div className="border-t border-white/10 px-3 py-2 animate-fade-in-up bg-[#0A0A0A]">
                            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={(e) => {
                                        editor.chain().focus().toggleBold().run();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className={`focus:outline-none ${editor.isActive('bold') ? 'text-white' : 'text-gray-500'}`}
                                    title="Negrito"
                                >
                                    <Icon name="format_bold" className="text-[22px]" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        editor.chain().focus().toggleItalic().run();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className={`focus:outline-none ${editor.isActive('italic') ? 'text-white' : 'text-gray-500'}`}
                                    title="Itálico"
                                >
                                    <Icon name="format_italic" className="text-[22px]" />
                                </button>

                                <div className="w-px h-4 bg-white/10 shrink-0"></div>

                                <EmojiPickerButton
                                    onClick={toggleEmojiPicker}
                                    isActive={showEmojiPicker}
                                />

                                {/* GIF BUTTON */}
                                <button
                                    onClick={(e) => {
                                        toggleGifPicker();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className={`focus:outline-none ${showGifPicker ? 'text-white' : 'text-gray-500'}`}
                                    title="GIF"
                                >
                                    <Icon name="gif_box" className="text-[22px]" />
                                </button>

                                {/* VOICE MESSAGE BUTTON */}
                                <button
                                    onClick={(e) => {
                                        handleStartRecording();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className="focus:outline-none text-gray-500 hover:text-white transition-colors"
                                    title="Mensagem de Voz"
                                >
                                    <Icon name="mic" className="text-[22px]" />
                                </button>

                                <ImageUploadButton editor={editor} />


                                <button
                                    onClick={(e) => {
                                        editor.chain().focus().toggleBulletList().run();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className={`focus:outline-none ${editor.isActive('bulletList') ? 'text-white' : 'text-gray-500'}`}
                                    title="Lista"
                                >
                                    <Icon name="format_list_bulleted" className="text-[22px]" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        editor.chain().focus().toggleOrderedList().run();
                                        (e.currentTarget as HTMLButtonElement).blur();
                                    }}
                                    className={`focus:outline-none ${editor.isActive('orderedList') ? 'text-white' : 'text-gray-500'}`}
                                    title="Lista Numerada"
                                >
                                    <Icon name="format_list_numbered" className="text-[22px]" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* EMOJI PICKER DRAWER (WhatsApp Style - Below Input) */}
            {showEmojiPicker && (
                <div className="w-full mt-2 animate-fade-in-up">
                    <div className="bg-[#121212] rounded-lg border border-white/10 shadow-2xl overflow-hidden">
                        <div className="w-full flex justify-center bg-[#121212]">
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={Theme.DARK}
                                emojiStyle={EmojiStyle.APPLE}
                                previewConfig={{ showPreview: false }}
                                searchDisabled
                                width="100%"
                                height={250}
                                lazyLoadEmojis={false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* GIF PICKER DRAWER (Lightweight) */}
            {showGifPicker && (
                <div className="w-full mt-2 animate-fade-in-up">
                    <div className="bg-[#121212] rounded-lg border border-white/10 shadow-2xl overflow-hidden p-2">
                        {/* SEARCH BAR MOCK */}
                        <div className="mb-2 px-1">
                            <input
                                type="text"
                                placeholder="Pesquisar GIFs..."
                                className="w-full bg-[#1A1A1A] text-white text-sm rounded-md px-3 py-2 border border-white/5 focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* GIF GRID */}
                        <div className="grid grid-cols-3 gap-2 h-[250px] overflow-y-auto no-scrollbar">
                            {mockGifs.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => onGifClick(url)}
                                    className="relative aspect-video rounded-md overflow-hidden bg-white/5 hover:ring-2 ring-blue-500 transition-all group"
                                >
                                    <img
                                        src={url}
                                        alt="GIF"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Styles for ProseMirror/TipTap placeholder */}
            <style>{`
                /* SUPER AGGRESSIVE RESET - KILL THE BLUE & TAP HIGHLIGHT & SCROLLBARS */
                aside.EmojiPickerReact *,
                aside.EmojiPickerReact button {
                    outline: none !important;
                    outline-width: 0 !important;
                    box-shadow: none !important;
                    border-color: transparent !important;
                    -webkit-tap-highlight-color: transparent !important; /* Kills mobile blue tap box */
                    -webkit-focus-ring-color: transparent !important; /* Kills browser focus ring */
                }

                /* HIDE SCROLLBARS INSIDE PICKER */
                aside.EmojiPickerReact ::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                    background: transparent !important;
                }
                aside.EmojiPickerReact * {
                    -ms-overflow-style: none !important;  /* IE and Edge */
                    scrollbar-width: none !important;  /* Firefox */
                }
                
                /* Specific focus killers */
                aside.EmojiPickerReact button:focus,
                aside.EmojiPickerReact button:focus-visible,
                aside.EmojiPickerReact button:active {
                    outline: none !important;
                    box-shadow: none !important;
                    background-color: transparent !important;
                    -webkit-tap-highlight-color: transparent !important;
                }
                
                /* Make sticky category label text invisible */
                aside.epr-emoji-category-label, 
                h2.epr-emoji-category-label { 
                    font-size: 0px !important;     
                    padding: 0px !important;       
                    margin: 0px !important;        
                    height: 1px !important;        
                    line-height: 0px !important;
                    background-color: transparent !important;
                    border: none !important;
                    opacity: 0 !important;         
                    pointer-events: none;          
                    position: relative !important; 
                    display: block !important;     
                }
                
                /* Ensure category navigation bar (icons) is VISIBLE */
                .epr-category-nav { 
                    display: flex !important; 
                }

                /* REPLACING ICONS WITH PREMIUM 3D COLORFUL ICONS */
                
                /* Common styles for custom icons */
                button.epr-btn.epr-cat-btn {
                    background-color: transparent !important;
                    background-repeat: no-repeat !important;
                    background-position: center !important; 
                    background-size: 26px 26px !important; /* Larger for 3D detail */
                    border: none !important;
                    box-shadow: none !important;
                    border-radius: 8px !important;
                }
                
                /* Hide original image/svg inside the button */
                button.epr-btn.epr-cat-btn img,
                button.epr-btn.epr-cat-btn svg {
                    opacity: 0 !important; 
                    visibility: hidden !important;
                }

                /* 0. Recent / Frequently Used (3D Clock) */
                button.epr-search-container + .epr-category-nav > button:first-child,
                button[aria-label="Frequently Used"],
                .epr-icn-suggested {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Three%20O’Clock.png') !important;
                }

                /* 1. Smileys & People (3D Grinning Face) */
                button.epr-icn-smileys_people {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Smiling%20Eyes.png') !important;
                }

                /* 2. Animals & Nature (3D Cat) */
                button.epr-icn-animals_nature {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png') !important;
                }

                /* 3. Food & Drink (3D Hamburger) */
                button.epr-icn-food_drink {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Hamburger.png') !important;
                }

                /* 4. Travel & Places (3D Red Car) */
                button.epr-icn-travel_places {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Automobile.png') !important;
                }

                /* 5. Activities (3D Soccer Ball) */
                button.epr-icn-activities {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Soccer%20Ball.png') !important;
                }

                /* 6. Objects (3D T-Shirt) */
                button.epr-icn-objects {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/T-Shirt.png') !important;
                }

                /* 7. Symbols (3D Music Note) */
                button.epr-icn-symbols {
                    background-image: url('https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Musical%20Note.png') !important;
                }

                /* 8. Flags (3D Red Flag) */
                button.epr-icn-flags,
                .epr-category-nav > button:last-child {
                    background-image: url('https://cdn-icons-png.flaticon.com/512/3233/3233483.png') !important; /* 3D Glossy Red Flag */
                    background-repeat: no-repeat !important;
                    background-position: center !important;
                    background-size: 26px 26px !important;
                }
                
                /* Active State: Highlight Background */
                button.epr-btn.epr-cat-btn[aria-selected="true"] {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                    opacity: 1 !important;
                    transform: scale(1.15);
                }
                
                /* Inactive State: Slightly Dimmed */
                button.epr-btn.epr-cat-btn:not([aria-selected="true"]) {
                    opacity: 0.7;
                    filter: saturate(0.8); /* Slightly less intense when inactive */
                }    background-color: rgba(255, 255, 255, 0.15) !important; 
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.1) !important;
                    filter: grayscale(0%) brightness(1.2) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3)) !important;
                    opacity: 1 !important;
                    transform: scale(1.1);
                }

                /* 4. ORANGE DOT */
                @keyframes pulse-dot {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 6px #f97316; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }

                button.epr-btn.epr-cat-btn[aria-selected="true"]::after {
                    content: '';
                    position: absolute;
                    bottom: 0px;
                    right: 0px;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background-color: #f97316; /* Warm Orange */
                }
            `}</style>
        </div>
    );
};

export default FeedEditor;
