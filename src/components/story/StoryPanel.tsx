import { useState } from 'react';
import { useStoryStore } from '../../store/useStoryStore';
import { STORY_CHAPTERS } from '../../config/story';
import { ProgressBar } from '../common/ProgressBar';

export function StoryPanel() {
  const currentStoryNumber = useStoryStore(s => s.currentStoryNumber);
  const currentPartIndex = useStoryStore(s => s.currentPartIndex);
  const completedStories = useStoryStore(s => s.completedStories);
  const partProgress = useStoryStore(s => s.partProgress);
  const unlockedFeatures = useStoryStore(s => s.unlockedFeatures);

  const [collapsedChapters, setCollapsedChapters] = useState<Set<number>>(() => {
    // Completed chapters start collapsed
    return new Set(completedStories);
  });

  const toggleChapter = (num: number) => {
    setCollapsedChapters(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const allComplete = currentStoryNumber > STORY_CHAPTERS.length;

  // Current chapter (may not exist if all complete)
  const currentChapter = allComplete ? null : STORY_CHAPTERS[currentStoryNumber - 1];

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>
          Story Progression
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Complete story objectives to unlock new features and earn rewards.
        </p>
      </div>

      {/* All complete banner */}
      {allComplete && (
        <div
          className="p-6 rounded-lg mb-6 text-center"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '2px solid var(--color-accent)',
          }}
        >
          <div className="text-4xl mb-3">&#9733;</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
            All Stories Complete!
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            You have conquered every chapter of the wasteland story. All features are unlocked.
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {unlockedFeatures.map(f => (
              <span
                key={f}
                className="text-xs px-3 py-1 rounded"
                style={{
                  backgroundColor: 'var(--color-accent)' + '22',
                  color: 'var(--color-accent)',
                }}
              >
                {f.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chapter list */}
      <div className="space-y-6">
        {STORY_CHAPTERS.map((chapter) => {
          const isCompleted = completedStories.includes(chapter.number);
          const isCurrent = chapter.number === currentStoryNumber;
          const isFuture = chapter.number > currentStoryNumber;

          return (
            <div
              key={chapter.id}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: isCurrent
                  ? '2px solid var(--color-accent)'
                  : isCompleted
                    ? '1px solid var(--color-success)'
                    : '1px solid var(--color-border)',
                opacity: isFuture ? 0.5 : 1,
              }}
            >
              {/* Chapter header — clickable to collapse/expand */}
              <div
                className="px-5 py-4 cursor-pointer"
                onClick={() => toggleChapter(chapter.number)}
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: isCurrent ? 'var(--color-bg-tertiary)' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span style={{ color: 'var(--color-success)' }}>&#10003;</span>
                      )}
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{
                          backgroundColor: 'var(--color-accent)' + '33',
                          color: 'var(--color-accent)',
                        }}>CURRENT</span>
                      )}
                      {isFuture && (
                        <span style={{ color: 'var(--color-text-muted)' }}>&#128274;</span>
                      )}
                      <h3 className="text-lg font-bold" style={{
                        color: isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                        Chapter {chapter.number}: {chapter.title}
                      </h3>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {chapter.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Unlocks: <span style={{ color: 'var(--color-info)' }}>{chapter.unlocks.replace(/_/g, ' ')}</span>
                    </div>
                    {isCompleted && (
                      <div
                        className="text-xs mt-1 px-2 py-0.5 rounded inline-block"
                        style={{
                          backgroundColor: 'var(--color-success)' + '22',
                          color: 'var(--color-success)',
                        }}
                      >
                        Feature Unlocked!
                      </div>
                    )}
                    <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {collapsedChapters.has(chapter.number) ? '▶ Click to expand' : '▼ Click to collapse'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts list (only show when not collapsed, for current & completed chapters) */}
              {!isFuture && !collapsedChapters.has(chapter.number) && (
                <div className="px-5 py-3 space-y-2">
                  {chapter.parts.map((part, partIdx) => {
                    const isPartComplete = isCompleted || (isCurrent && partIdx < currentPartIndex);
                    const isPartCurrent = isCurrent && partIdx === currentPartIndex;
                    const isPartFuture = isCurrent && partIdx > currentPartIndex;
                    const progress = partProgress[part.id] || 0;

                    return (
                      <div
                        key={part.id}
                        className="rounded p-3"
                        style={{
                          backgroundColor: isPartCurrent
                            ? 'var(--color-bg-primary)'
                            : 'transparent',
                          border: isPartCurrent
                            ? '1px solid var(--color-accent)' + '44'
                            : '1px solid transparent',
                          opacity: isPartFuture ? 0.4 : 1,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {/* Status indicator */}
                          {isPartComplete && (
                            <span className="text-xs" style={{ color: 'var(--color-success)' }}>&#10003;</span>
                          )}
                          {isPartCurrent && (
                            <span className="text-xs" style={{ color: 'var(--color-accent)' }}>&#9654;</span>
                          )}
                          {isPartFuture && (
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>&#128274;</span>
                          )}

                          {/* Title */}
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: isPartComplete
                                ? 'var(--color-success)'
                                : isPartCurrent
                                  ? 'var(--color-text-primary)'
                                  : 'var(--color-text-muted)',
                            }}
                          >
                            {chapter.number}.{partIdx + 1} — {part.title}
                          </span>

                          {/* Reward badge */}
                          {isPartComplete && (
                            <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                              {part.rewards.map(r => r.type === 'wc' ? `${r.quantity} WC` : `${r.quantity}x ${(r.itemId || '').replace(/_/g, ' ')}`).join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Current part: show objective + progress */}
                        {isPartCurrent && (
                          <div className="mt-2">
                            <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                              {part.flavor}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span style={{ color: 'var(--color-text-primary)' }}>
                                    {part.objective.description}
                                  </span>
                                  <span style={{ color: 'var(--color-accent)' }}>
                                    {Math.min(progress, part.objective.count)} / {part.objective.count}
                                  </span>
                                </div>
                                <ProgressBar
                                  value={Math.min(progress, part.objective.count)}
                                  max={part.objective.count}
                                  color="var(--color-accent)"
                                  height="8px"
                                />
                              </div>
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--color-info)' }}>
                              Hint: {part.hint}
                            </p>
                            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                              Reward: {part.rewards.map(r => r.type === 'wc' ? `${r.quantity} WC` : `${r.quantity}x ${(r.itemId || '').replace(/_/g, ' ')}`).join(', ')}
                            </div>
                          </div>
                        )}

                        {/* Completed part: description only */}
                        {isPartComplete && (
                          <p className="text-xs ml-5" style={{ color: 'var(--color-text-muted)' }}>
                            {part.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
