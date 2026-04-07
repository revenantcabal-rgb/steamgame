import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const MAX_SLOTS = 4;

export function CharacterSelect() {
  const user = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const characterSlots = useAuthStore(s => s.characterSlots);
  const selectSlot = useAuthStore(s => s.selectSlot);
  const createCharacter = useAuthStore(s => s.createCharacter);
  const deleteCharacter = useAuthStore(s => s.deleteCharacter);
  const logout = useAuthStore(s => s.logout);

  const [creatingSlot, setCreatingSlot] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [deletingSlot, setDeletingSlot] = useState<number | null>(null);

  const handleCreate = (slotIndex: number) => {
    if (!newName.trim()) return;
    createCharacter(slotIndex, newName.trim());
    setNewName('');
    setCreatingSlot(null);
  };

  const handleDelete = (slotIndex: number) => {
    deleteCharacter(slotIndex);
    setDeletingSlot(null);
  };

  const formatLastPlayed = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen min-h-dvh w-full flex-1 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Select Character</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {isGuest ? 'Playing as Guest' : user?.username}
              {isGuest && <span style={{ color: 'var(--color-energy)' }}> — register to keep your progress</span>}
            </p>
          </div>
          <button onClick={() => void logout()} className="px-3 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            Logout
          </button>
        </div>

        {/* Slots */}
        <div className="space-y-3">
          {Array.from({ length: MAX_SLOTS }, (_, i) => {
            const slot = characterSlots.find(s => s.slotIndex === i);
            const isCreating = creatingSlot === i;
            const isDeleting = deletingSlot === i;

            return (
              <div key={i} className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                {/* Slot Header */}
                <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
                    Slot {i + 1}
                  </span>
                  <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
                </div>

                {/* Slot Content */}
                <div className="p-4">
                  {slot ? (
                    // Existing character
                    isDeleting ? (
                      <div>
                        <p className="text-xs mb-3" style={{ color: 'var(--color-danger)' }}>
                          Delete <b>{slot.name}</b>? This cannot be undone. All progress will be lost.
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => handleDelete(i)}
                            className="flex-1 py-2 rounded text-xs font-bold cursor-pointer"
                            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
                            DELETE FOREVER
                          </button>
                          <button onClick={() => setDeletingSlot(null)}
                            className="flex-1 py-2 rounded text-xs cursor-pointer"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{slot.name}</h3>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
                              {isGuest ? 'Guest' : 'Standard'}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {slot.heroCount > 0 ? `${slot.heroCount} Heroes` : 'New'}
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Last Online: {formatLastPlayed(slot.lastPlayedAt)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => selectSlot(i)}
                            className="px-6 py-2 rounded text-sm font-bold cursor-pointer"
                            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
                            PLAY
                          </button>
                          <button onClick={() => setDeletingSlot(i)}
                            className="px-3 py-2 rounded text-sm cursor-pointer"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                            X
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    // Empty slot
                    isCreating ? (
                      <div>
                        <input type="text" placeholder="Character Name" value={newName}
                          onChange={e => setNewName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreate(i)}
                          maxLength={20} autoFocus
                          className="w-full p-2 rounded text-sm mb-2"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-accent)' }} />
                        <div className="flex gap-2">
                          <button onClick={() => handleCreate(i)}
                            disabled={!newName.trim()}
                            className="flex-1 py-2 rounded text-xs font-bold cursor-pointer"
                            style={{ backgroundColor: newName.trim() ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: newName.trim() ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
                            CREATE
                          </button>
                          <button onClick={() => { setCreatingSlot(null); setNewName(''); }}
                            className="flex-1 py-2 rounded text-xs cursor-pointer"
                            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setCreatingSlot(i); setNewName(''); }}
                        className="w-full py-3 text-center cursor-pointer rounded"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                        <span className="font-bold">Empty</span>
                        <span className="text-xs block mt-1">Click to create new character</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
