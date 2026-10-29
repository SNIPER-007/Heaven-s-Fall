import React, { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Header } from './components/Header';
import { TreasuryDashboard } from './components/TreasuryDashboard';
import { TaskTracker } from './components/TaskTracker';
import { TransactionHistory } from './components/TransactionHistory';
import { TransactionModal } from './components/TransactionModal';
import { OpeningBalanceModal } from './components/OpeningBalanceModal';
import { FirebaseModal } from './components/FirebaseModal';
import { ProjectorMode } from './components/ProjectorMode';
import { DramaticAnnouncement } from './components/DramaticAnnouncement';
import type { Team, TransactionType } from './types/game';

const MainAppContent: React.FC = () => {
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [preselectedTeam, setPreselectedTeam] = useState<Team>('rulers');
  const [preselectedType, setPreselectedType] = useState<TransactionType>('ADD');
  const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);

  const handleOpenTransaction = (team: Team = 'rulers', type: TransactionType = 'ADD') => {
    setPreselectedTeam(team);
    setPreselectedType(type);
    setIsTransactionModalOpen(true);
  };

  if (isProjectorMode) {
    return <ProjectorMode onExit={() => setIsProjectorMode(false)} />;
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-blood-700 selection:text-white">
      {/* Cinematic ambient background effects */}
      <BackgroundEffects />

      {/* Header */}
      <Header
        onOpenProjector={() => setIsProjectorMode(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenOpeningBalanceModal={() => setIsOpeningBalanceModalOpen(true)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Treasury Dashboard with Live Rise & Fall Status */}
        <section aria-label="Treasury Scoreboard">
          <TreasuryDashboard onOpenTransactionModal={handleOpenTransaction} />
        </section>

        {/* Task Tracker (Names Only, Manual Entry) */}
        <section aria-label="Task Tracker">
          <TaskTracker />
        </section>

        {/* Transaction History & Audit Ledger */}
        <section aria-label="Transaction Ledger">
          <TransactionHistory />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-[#09050b]/80 py-5 px-4 text-center text-xs text-zinc-500 font-cinzel">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HEAVEN'S FALL • RISE & FALL (HALLOWEEN EDITION)</span>
          <span>ROTARACT CLUB OF MUMBAI GHATKOPAR (RCMG)</span>
          <span className="text-[11px] text-zinc-600 font-mono">15 PLAYERS • LIVE EVENT DASHBOARD</span>
        </div>
      </footer>

      {/* Global Modals & Overlays */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        preselectedTeam={preselectedTeam}
        preselectedType={preselectedType}
      />

      <OpeningBalanceModal
        isOpen={isOpeningBalanceModalOpen}
        onClose={() => setIsOpeningBalanceModalOpen(false)}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Dramatic Announcement Overlay for Overthrow & Reclaim */}
      <DramaticAnnouncement />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
