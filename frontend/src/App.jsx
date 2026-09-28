import React, { useState, useMemo, useCallback } from "react";
import Navbar from "./components/Navbar.jsx";
import PatientCaseSidebar from "./components/PatientCaseSidebar.jsx";
import CurrentStudyCard from "./components/CurrentStudyCard.jsx";
import PriorStudyResults from "./components/PriorStudyResults.jsx";
import WhyThisMatchEvidence from "./components/WhyThisMatchEvidence.jsx";
import ClinicalTimelineSidebar from "./components/ClinicalTimelineSidebar.jsx";
import FooterStatusBar from "./components/FooterStatusBar.jsx";

import ConfirmPriorModal from "./components/ConfirmPriorModal.jsx";
import OverrideModal from "./components/OverrideModal.jsx";
import FullStudyViewerModal from "./components/FullStudyViewerModal.jsx";
import AuditTrailModal from "./components/AuditTrailModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";

import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import DashboardView from "./components/DashboardView.jsx";
import OverrideAnalyticsView from "./components/OverrideAnalyticsView.jsx";
import StakeholderValidationPanel from "./components/StakeholderValidationPanel.jsx";

import { MOCK_PATIENT_CASES, INITIAL_AUDIT_LOG } from "./data/mockRadiologyData.js";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const SCREEN = { LOGIN: "login", REGISTER: "register", APP: "app" };
const VIEW = { WORKSPACE: "workspace", DASHBOARD: "dashboard", ANALYTICS: "analytics", VALIDATION: "validation" };

export default function App() {
  const [screen, setScreen] = useState(SCREEN.LOGIN);
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState(VIEW.WORKSPACE);

  const [allCases] = useState(MOCK_PATIENT_CASES);
  const [currentCaseId, setCurrentCaseId] = useState("case-1");
  const currentCase = useMemo(
    () => allCases.find((c) => c.id === currentCaseId) || allCases[0],
    [allCases, currentCaseId]
  );

  const [selectedPriorId, setSelectedPriorId] = useState("prior-101");

  const [filters, setFilters] = useState({
    anatomy: "ALL", modality: "ALL", dateRange: "ALL", institution: "ALL", minScore: 0,
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isFullViewerOpen, setIsFullViewerOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOG);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const handleLoginSuccess = useCallback((sessionData) => {
    setUser(sessionData);
    setScreen(SCREEN.APP);
    setActiveView(VIEW.DASHBOARD);
    showToast("Welcome, " + (sessionData.display_name || sessionData.username) + "!", "success");
  }, [showToast]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setScreen(SCREEN.LOGIN);
    setActiveView(VIEW.WORKSPACE);
  }, []);

  const handleSelectCase = useCallback((newCase) => {
    setCurrentCaseId(newCase.id);
    if (newCase.priorStudies && newCase.priorStudies.length > 0) {
      setSelectedPriorId(newCase.priorStudies[0].id);
    } else {
      setSelectedPriorId(null);
    }
    setActiveView(VIEW.WORKSPACE);
    showToast("Loaded Patient Case: " + newCase.patientName + " (" + newCase.patientId + ")", "info");
  }, [showToast]);

  const handleUpdateFilters = useCallback((key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value })), []);

  const handleResetFilters = useCallback(() => {
    setFilters({ anatomy: "ALL", modality: "ALL", dateRange: "ALL", institution: "ALL", minScore: 0 });
    showToast("Filters reset to default", "info");
  }, [showToast]);

  const filteredPriors = useMemo(() => {
    if (!currentCase || !currentCase.priorStudies) return [];
    return currentCase.priorStudies.filter((p) => {
      if (filters.modality !== "ALL") {
        if (!p.studyName.toUpperCase().includes(filters.modality)) return false;
      }
      if (p.matchScore < filters.minScore) return false;
      if (filters.anatomy !== "ALL") {
        const title = p.studyName.toUpperCase();
        if (filters.anatomy === "CHEST" && !title.includes("CHEST")) return false;
        if (filters.anatomy === "SPINE" && !title.includes("SPINE") && !title.includes("CERVICAL")) return false;
        if (filters.anatomy === "ABDOMEN" && !title.includes("ABDOMEN") && !title.includes("PELVIS")) return false;
      }
      return true;
    });
  }, [currentCase, filters]);

  const activePrior = useMemo(() => {
    if (!currentCase || !currentCase.priorStudies || currentCase.priorStudies.length === 0) return null;
    return currentCase.priorStudies.find((p) => p.id === selectedPriorId) || currentCase.priorStudies[0];
  }, [currentCase, selectedPriorId]);

  const handleConfirmPrior = useCallback((data) => {
    const newLog = {
      id: "aud-" + Date.now().toString().slice(-4),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + " EST",
      user: data.signature || (user && user.display_name) || "Dr. Elena Vance, MD",
      action: "CONFIRMED_PRIOR",
      caseId: currentCase.id,
      patientId: currentCase.patientId,
      currentStudyId: currentCase.currentStudy.studyId,
      selectedPriorId: data.priorId,
      priorName: data.priorName,
      matchScore: data.matchScore,
      reason: data.notes || "Human radiologist verified clinical match relevance.",
      attestation: data.attestation,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setIsConfirmModalOpen(false);
    showToast("Prior Study Confirmed & Signed: " + data.priorName, "success");
  }, [currentCase, user, showToast]);

  const handleOverrideSubmit = useCallback((data) => {
    const newLog = {
      id: "aud-" + Date.now().toString().slice(-4),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + " EST",
      user: data.user || (user && user.display_name) || "Dr. Elena Vance, MD",
      action: "OVERRIDE_MATCH",
      caseId: currentCase.id,
      patientId: currentCase.patientId,
      currentStudyId: currentCase.currentStudy.studyId,
      selectedPriorId: data.priorId,
      priorName: data.priorName,
      matchScore: activePrior ? activePrior.matchScore : 0,
      reason: "OVERRIDE_REASON: " + data.reason + ". " + data.detailedNotes,
      attestation: "Physician recorded clinical override.",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (data.alternativePriorId) setSelectedPriorId(data.alternativePriorId);
    setIsOverrideModalOpen(false);
    showToast("Match Overridden: Reason \"" + data.reason + "\" recorded in audit trail", "warning");
  }, [currentCase, user, activePrior, showToast]);

  // -- Auth screens ----------------------------------------------------------
  if (screen === SCREEN.LOGIN) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setScreen(SCREEN.REGISTER)}
      />
    );
  }

  if (screen === SCREEN.REGISTER) {
    return (
      <RegisterPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setScreen(SCREEN.LOGIN)}
      />
    );
  }

  // -- Authenticated app -----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col font-sans pb-16">

      <Navbar
        user={user}
        activeView={activeView}
        onSetView={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        onLogout={handleLogout}
        auditCount={auditLogs.length}
        allCases={allCases}
        currentCase={currentCase}
        onSelectCase={handleSelectCase}
      />

      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={"px-4 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-2xl backdrop-blur-md " + (
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toast.type === "warning"
              ? "bg-amber-950/90 border-amber-500/50 text-amber-200"
              : "bg-cyan-950/90 border-cyan-500/50 text-cyan-200"
          )}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400" />
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {activeView === VIEW.DASHBOARD && (
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
          <DashboardView
            user={user}
            auditCount={auditLogs.length}
            studies={allCases.flatMap((c) => c.priorStudies || [])}
            auditLogs={auditLogs}
          />
        </main>
      )}

      {activeView === VIEW.ANALYTICS && (
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-6">
          <OverrideAnalyticsView />
        </main>
      )}

      {activeView === VIEW.VALIDATION && (
        <main className="flex-1 w-full max-w-[900px] mx-auto px-4 lg:px-8 py-6">
          <StakeholderValidationPanel user={user} />
        </main>
      )}

      {activeView === VIEW.WORKSPACE && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-4">
          <PatientCaseSidebar
            allCases={allCases}
            currentCase={currentCase}
            onSelectCase={handleSelectCase}
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onResetFilters={handleResetFilters}
          />

          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <CurrentStudyCard
              study={currentCase.currentStudy}
              patient={currentCase}
              onViewFullStudy={() => setIsFullViewerOpen(true)}
            />

            <PriorStudyResults
              priorStudies={filteredPriors}
              selectedPriorId={selectedPriorId}
              onSelectPrior={setSelectedPriorId}
              onConfirmPrior={(prior) => {
                setSelectedPriorId(prior.id);
                setIsConfirmModalOpen(true);
              }}
              onOverridePrior={(prior) => {
                setSelectedPriorId(prior.id);
                setIsOverrideModalOpen(true);
              }}
            />

            {activePrior && (
              <WhyThisMatchEvidence
                activePrior={activePrior}
                currentStudy={currentCase.currentStudy}
                onConfirmPrior={() => setIsConfirmModalOpen(true)}
                onOverrideMatch={() => setIsOverrideModalOpen(true)}
                onViewFullStudy={() => setIsFullViewerOpen(true)}
              />
            )}
          </div>

          <ClinicalTimelineSidebar
            priorStudies={currentCase.priorStudies}
            selectedPriorId={selectedPriorId}
            onSelectPrior={setSelectedPriorId}
            changeOverTime={currentCase.changeOverTime}
          />
        </main>
      )}

      {activeView === VIEW.WORKSPACE && (
        <FooterStatusBar
          auditCount={auditLogs.length}
          onOpenAuditTrail={() => setIsAuditModalOpen(true)}
          timeToLocate="1.8s"
        />
      )}

      <ConfirmPriorModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        prior={activePrior}
        currentStudy={currentCase.currentStudy}
        patient={currentCase}
        onConfirm={handleConfirmPrior}
      />

      <OverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        prior={activePrior}
        allPriors={currentCase.priorStudies}
        patient={currentCase}
        onOverrideSubmit={handleOverrideSubmit}
      />

      <FullStudyViewerModal
        isOpen={isFullViewerOpen}
        onClose={() => setIsFullViewerOpen(false)}
        currentStudy={currentCase.currentStudy}
        priorStudy={activePrior}
        patient={currentCase}
      />

      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
