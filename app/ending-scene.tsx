'use client';
import { useState } from 'react';
import { ChevronRight, PawPrint } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BREEDS, RAID_LIST, type GameState } from '@/lib/game/model';
import { mapAsset } from '@/lib/game/maps';
import Portrait from './portrait';
import TravelerPreview from './traveler-preview';

export default function EndingScene({
  state,
  onClose,
}: {
  state: GameState;
  onClose: () => void;
}) {
  const [chapter, setChapter] = useState(0);
  const friends = [
    state.dogs.find((dog) => dog.id === 'starter')!,
    ...state.dogs.filter(
      (dog) => dog.id !== 'starter' && state.party.includes(dog.id),
    ),
  ].slice(0, 2);
  const scenes = [
    {
      title: '마지막 목줄이 풀리던 밤',
      text: '여덟 용의 목줄에서 마지막 불빛이 꺼졌어요. 강변에서 폭풍 고원까지, 용들은 마침내 자유를 되찾았습니다.',
      region: 5,
    },
    {
      title: '다시 평화로운 테일즈 시티',
      text: '용을 조종하던 검은 목줄단의 계획은 무너졌어요. 형사 준과 주민들은 남겨진 단서를 모아 범죄 조직을 해체했습니다.',
      region: 1,
    },
    {
      title: '우리의 산책은 계속된다',
      text: `${state.playerName}와 리치가 마을로 돌아오자 주민들의 환호가 울려 퍼졌어요. 세상을 구한 건 작은 발자국들과, 끝까지 함께한 마음이었습니다.`,
      region: 1,
    },
  ];
  const scene = scenes[chapter];
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="game-dialog ending-dialog">
        <div
          className="ending-art"
          style={{
            backgroundImage: `linear-gradient(0deg, #203c34b3, transparent 65%), url(${mapAsset(scene.region)})`,
          }}
        >
          <span className="ending-medal">
            <PawPrint size={16} /> STORY COMPLETE · {RAID_LIST.length}/
            {RAID_LIST.length}
          </span>
          <div className="ending-friends">
            <TravelerPreview appearance={state.appearance} size={112} walking />
            {friends.map((dog) => (
              <Portrait
                key={dog.id}
                sprite={BREEDS[dog.breed].sprite}
                size={100}
              />
            ))}
          </div>
        </div>
        <div className="ending-copy" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">
            EPILOGUE · {chapter + 1} / {scenes.length}
          </span>
          <DialogTitle className="dialog-title">{scene.title}</DialogTitle>
          <DialogDescription>{scene.text}</DialogDescription>
          {chapter === 2 && (
            <div className="ending-record">
              <span>
                <b>{state.playerName}</b> Lv.{state.hero.level}
              </span>
              <span>
                <b>{state.dogs.length}마리</b> 함께한 친구
              </span>
              <span>
                <b>{state.rescued.length}마리</b> 구조한 고양이
              </span>
            </div>
          )}
        </div>
        <div className="ending-actions">
          <span>함께 모험해 주셔서 고마워요.</span>
          <button
            className="primary-button"
            onClick={() => (chapter < 2 ? setChapter(chapter + 1) : onClose())}
          >
            {chapter < 2 ? '다음 장면' : '모험 계속하기'}
            <ChevronRight size={18} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
