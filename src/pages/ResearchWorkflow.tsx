import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Users, FileText, AlertCircle, Info } from 'lucide-react';
import { Arrow } from '../components/ui/arrow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CATEGORY_DESCRIPTIONS, getStudyTagDescription, getCategoryBackgroundColor, getCategoryBorderColor, getStudyTagColor, getStudyTagBorderColor } from '@/lib/classification-categories';
import Header from '../components/layout/Header';
import { SEO } from '@/components/SEO';

const ResearchWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<'validation' | 'qualityCheck' | 'evidenceStrength' | 'human' | 'studyTag' | 'sample' | 'stance' | null>(null);
  const [validationAnswers, setValidationAnswers] = useState({
    hasConflict: false,
    isNarrativeReview: false,
  });
  const [qualityCheckAnswers, setQualityCheckAnswers] = useState({
    studyDesign: true as boolean | true,
    controlGroup: true as boolean | true,
    biasAddressed: true as boolean | true,
    statistics: true as boolean | true
  });
  const [evidenceStrength, setEvidenceStrength] = useState<'strong' | 'weak' | null>(null);
  const [stance, setStance] = useState<'Supporting' | 'Contradicting' | null>(null);
  const [answers, setAnswers] = useState({});
  const [classification, setClassification] = useState(null);
  const [highlightPath, setHighlightPath] = useState([]);
  const [selectedStudyType, setSelectedStudyType] = useState<'Observational' | 'Clinical Trial' | null>(null);

  const visualRef = useRef(null);
  const validationRef = useRef(null);
  const qualityCheckRef = useRef(null);
  const evidenceStrengthRef = useRef(null);
  const humanRef = useRef(null);
  const studyTagRef = useRef(null);
  const sampleRef = useRef(null);
  const stanceRef = useRef(null);

  const validationQuestions = [
    { id: 'hasConflict', label: 'Does it have conflicts of interest?' },
    { id: 'isNarrativeReview', label: 'Is this a narrative review?' },
  ];

  const qualityCheckQuestions = [
    { id: 'studyDesign', label: 'Does the study have a valid design (randomized, controlled, etc.)?' },
    { id: 'controlGroup', label: 'Does the study include an appropriate control group?' },
    { id: 'biasAddressed', label: 'Does the study address potential biases?' },
    { id: 'statistics', label: 'Are the statistical methods appropriate and clearly described?' }
  ];

  const steps = [
    {
      id: 'human',
      question: 'Is the study conducted in humans?',
      options: [
        { value: 'yes', label: 'Yes', next: 'studyTag' },
        { value: 'no', label: 'No', result: 'Not Tested in Humans' }
      ]
    },
    {
      id: 'studyTag',
      question: 'What type of human study is this?',
      options: [
        { value: 'Observational', label: 'Observational', next: 'sample' },
        { value: 'Clinical Trial', label: 'Clinical Trial', next: 'sample' }
      ]
    },
    {
      id: 'sample',
      question: 'What is the study\'s sample size?',
      options: [
        { value: 'small', label: 'Less than 100 people', result: 'Limited Tested in Humans' },
        { value: 'medium', label: '100 - 500,000 people', result: 'Tested in Humans' },
        { value: 'large', label: 'More than 500,000 people', result: 'Widely Tested in Humans' }
      ]
    }
  ];

  const handleValidationAnswer = (questionId, answer) => {
    setValidationAnswers({ ...validationAnswers, [questionId]: answer });
  };

  const handleQualityCheckAnswer = (questionId, answer) => {
    setQualityCheckAnswers({ ...qualityCheckAnswers, [questionId]: answer });
  };

  const canProceedFromValidation = () => {
    return Object.values(validationAnswers).every(answer => answer !== null && answer !== undefined);
  };

  const canProceedFromQualityCheck = () => {
    return Object.values(qualityCheckAnswers).every(answer => answer !== null);
  };

  const proceedFromValidation = () => {
    const hasAnyYes = Object.values(validationAnswers).some(answer => answer === true);
    if (hasAnyYes) {
      setClassification('Invalid');
      setHighlightPath(['validation-invalid']);
    } else {
      setCurrentStep(1);
      setHighlightPath(['validation-pass']);
    }
  };

  const proceedFromQualityCheck = () => {
    const hasAnyNo = Object.values(qualityCheckAnswers).some(answer => answer === false);
    if (hasAnyNo) {
      setClassification('Inconclusive');
      setHighlightPath(['validation-pass', 'qualityCheck-no']);
    } else {
      setCurrentStep(2);
      setHighlightPath(['validation-pass', 'qualityCheck-pass']);
    }
  };

  const proceedFromEvidenceStrength = () => {
    if (evidenceStrength === 'weak') {
      setClassification('Inconclusive');
      setHighlightPath(prev => [...prev, 'evidenceStrength-weak']);
    } else if (evidenceStrength === 'strong') {
      setCurrentStep(3);
      setHighlightPath(prev => [...prev, 'evidenceStrength-strong']);
    }
  };

  const proceedFromStance = () => {
    if (stance) {
      setHighlightPath(prev => [...prev, `stance-${stance.toLowerCase()}`]);
    }
  };

  const handleAnswer = (option) => {
    const stepIndex = currentStep - 3;
    const newAnswers = { ...answers, [steps[stepIndex].id]: option.value };
    setAnswers(newAnswers);

    const newPath = [...highlightPath, steps[stepIndex].id + '-' + option.value];
    setHighlightPath(newPath);

    if (steps[stepIndex].id === 'studyTag') {
      setSelectedStudyType(option.value as 'Observational' | 'Clinical Trial');
    }

    if (option.result) {
      setClassification(option.result);
      setCurrentStep(6);
    } else if (option.next) {
      const nextStepIndex = steps.findIndex(s => s.id === option.next);
      setCurrentStep(nextStepIndex + 3);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(0);
    setValidationAnswers({ hasConflict: false, isNarrativeReview: false });
    setQualityCheckAnswers({ studyDesign: true, controlGroup: true, biasAddressed: true, statistics: true });
    setEvidenceStrength(null);
    setStance(null);
    setAnswers({});
    setClassification(null);
    setHighlightPath([]);
    setDialogOpen(false);
    setActiveNode(null);
    setSelectedStudyType(null);
  };

  const handleNodeClick = (node: 'validation' | 'qualityCheck' | 'evidenceStrength' | 'human' | 'studyTag' | 'sample' | 'stance') => {
    setActiveNode(node);
    setDialogOpen(true);
  };

  const getClassificationIcon = (cls: string) => {
    switch(cls) {
      case 'Widely Tested in Humans': return <CheckCircle className="w-12 h-12" />;
      case 'Tested in Humans': return <Users className="w-12 h-12" />;
      case 'Limited Tested in Humans': return <AlertCircle className="w-12 h-12" />;
      case 'Not Tested in Humans': return <FileText className="w-12 h-12" />;
      case 'Invalid':
      case 'Inconclusive':
        return <XCircle className="w-12 h-12" />;
      default: return <FileText className="w-12 h-12" />;
    }
  };

  const isNodeActive = (nodeId: string) => {
    if (currentStep === 0 && nodeId === 'validation') return true;
    if (currentStep === 1 && nodeId === 'qualityCheck') return true;
    if (currentStep === 2 && nodeId === 'evidenceStrength') return true;
    if (currentStep === 3 && nodeId === 'human') return true;
    if (currentStep === 4 && nodeId === 'studyTag') return true;
    if (currentStep === 5 && nodeId === 'sample') return true;
    if (currentStep === 6 && nodeId === 'stance') return true;
    if (classification) return highlightPath.includes(nodeId);
    return false;
  };

  const isPathActive = (pathId: string) => highlightPath.includes(pathId);

  const getTotalSteps = () => 7;
  const getCurrentStepNumber = () => {
    if (currentStep === 0) return 1;
    return currentStep + 1;
  };

  useEffect(() => {
    const container = visualRef.current;
    let targetEl = null;
    if (currentStep === 0) targetEl = validationRef.current;
    else if (currentStep === 1) targetEl = qualityCheckRef.current;
    else if (currentStep === 2) targetEl = evidenceStrengthRef.current;
    else if (currentStep === 3) targetEl = humanRef.current;
    else if (currentStep === 4) targetEl = studyTagRef.current;
    else if (currentStep === 5) targetEl = sampleRef.current;
    else if (currentStep === 6) targetEl = stanceRef.current;

    if (container && targetEl && typeof container.scrollTo === 'function') {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const targetCenter = (targetRect.left - containerRect.left) + (targetRect.width / 2) + container.scrollLeft;
      const left = Math.max(0, Math.min(targetCenter - container.clientWidth / 2, container.scrollWidth - container.clientWidth));
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [currentStep, highlightPath, classification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <SEO
        title="Research Workflow"
        description="Learn how we review and classify scientific research for women's health claims. Understand our expert review process and evidence evaluation methodology."
        url="/workflow"
        keywords="research workflow, evidence review, scientific methodology, expert review process, health research evaluation"
      />
      <Header />

      <main className="pt-24 pb-16">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Research Publication Classification
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-2">
                Our workflow helps classify research publications based on study quality,
                evidence strength, population type, and sample size to provide clear evidence ratings.
              </p>
              <p className="text-xs md:text-sm text-blue-600 font-medium">
                Click on any step to view questions • Active steps can be answered
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Visual Workflow */}
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-100 w-full max-w-[1400px] mx-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs md:text-sm font-medium text-gray-700">
                      Step {getCurrentStepNumber()} of {getTotalSteps()}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      {Math.round((getCurrentStepNumber() / getTotalSteps()) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-6 mt-4">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900">Workflow</h2>
                    <button
                      onClick={resetWorkflow}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 border border-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div ref={visualRef} className="overflow-x-auto pt-6 pb-6 pl-6 pr-6">
                  <div className="flex items-start justify-center gap-4 min-w-max">

                    {/* Column 1: Validation */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('validation')}
                        ref={validationRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('validation')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('validation') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">1</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Validation</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('validation') ? 'Click to answer' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="Any yes" direction="vertical" isActive={isPathActive('validation-invalid')} />
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                              isPathActive('validation-invalid') ? `${getCategoryBackgroundColor('Invalid')} ${getCategoryBorderColor('Invalid')}` : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-center gap-1">
                                <p className="text-xs font-semibold text-gray-700">Invalid</p>
                                <Info className="w-3 h-3 text-gray-500" />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <p className="text-sm"><strong>Invalid:</strong> {CATEGORY_DESCRIPTIONS['Invalid']}</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={40} label="All No" isActive={isPathActive('validation-pass')} />
                    </div>

                    {/* Column 2: Quality Checks */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('qualityCheck')}
                        ref={qualityCheckRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('qualityCheck')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('qualityCheck') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">2</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Quality Checks</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('qualityCheck') ? 'Click to answer' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="Any No" direction="vertical" isActive={isPathActive('qualityCheck-no')} />
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                              isPathActive('qualityCheck-no') ? `${getCategoryBackgroundColor('Inconclusive')} ${getCategoryBorderColor('Inconclusive')}` : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-center gap-1">
                                <p className="text-xs font-semibold text-gray-700">Inconclusive</p>
                                <Info className="w-3 h-3 text-gray-500" />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <p className="text-sm">{CATEGORY_DESCRIPTIONS['Inconclusive']}</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={40} label="All Pass" isActive={isPathActive('qualityCheck-pass')} />
                    </div>

                    {/* Column 3: Evidence Strength */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('evidenceStrength')}
                        ref={evidenceStrengthRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('evidenceStrength')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('evidenceStrength') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">3</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Evidence Strength</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('evidenceStrength') ? 'Click to answer' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="Weak" direction="vertical" isActive={isPathActive('evidenceStrength-weak')} />
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                              isPathActive('evidenceStrength-weak') ? `${getCategoryBackgroundColor('Inconclusive')} ${getCategoryBorderColor('Inconclusive')}` : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-center gap-1">
                                <p className="text-xs font-semibold text-gray-700">Inconclusive</p>
                                <Info className="w-3 h-3 text-gray-500" />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <p className="text-sm">{CATEGORY_DESCRIPTIONS['Inconclusive']}</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={40} label="Strong" isActive={isPathActive('evidenceStrength-strong')} />
                    </div>

                    {/* Column 4: Human Study */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('human')}
                        ref={humanRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('human')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('human') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">4</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Human Study?</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('human') ? 'Click to answer' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="No" direction="vertical" isActive={isPathActive('human-no')} />
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                              isPathActive('human-no') ? `${getCategoryBackgroundColor('Not Tested in Humans')} ${getCategoryBorderColor('Not Tested in Humans')}` : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-center gap-1">
                                <p className="text-xs font-semibold text-gray-700">Not Tested</p>
                                <Info className="w-3 h-3 text-gray-500" />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <p className="text-sm">{CATEGORY_DESCRIPTIONS['Not Tested in Humans']}</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={50} label="Yes" isActive={isPathActive('human-yes')} />
                    </div>

                    {/* Column 5: Study Type */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('studyTag')}
                        ref={studyTagRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('studyTag')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('studyTag') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">5</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Study Type</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('studyTag') ? 'Click to specify' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="Type" direction="vertical" isActive={isPathActive('studyTag-Observational') || isPathActive('studyTag-Clinical Trial')} />
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                              selectedStudyType
                                ? `${getStudyTagColor(selectedStudyType)} ${getStudyTagBorderColor(selectedStudyType)} shadow-md`
                                : isPathActive('studyTag-Observational') || isPathActive('studyTag-Clinical Trial')
                                ? 'border-gray-400 bg-gray-100 shadow-md'
                                : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-center gap-1">
                                <p className={`text-xs font-semibold ${selectedStudyType ? '' : 'text-gray-700'}`}>
                                  {selectedStudyType || 'Observational / Trial'}
                                </p>
                                <Info className={`w-3 h-3 ${selectedStudyType ? '' : 'text-gray-500'}`} />
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <p className="text-sm"><strong>Observational:</strong> {getStudyTagDescription('Observational')}</p>
                              <p className="text-sm"><strong>Clinical Trial:</strong> {getStudyTagDescription('Clinical Trial')}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={40} label="Then" isActive={isPathActive('studyTag-Observational') || isPathActive('studyTag-Clinical Trial')} />
                    </div>

                    {/* Column 6: Sample Size */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('sample')}
                        ref={sampleRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('sample')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('sample') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">6</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Sample Size</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('sample') ? 'Click to answer' : 'Click to view'}</p>
                        </div>
                      </button>
                    </div>

                    {/* Sample Size outcomes */}
                    <div className="flex flex-col items-center flex-2">
                      <div className="flex flex-col items-center w-full space-y-3">
                        <div className="flex items-center w-full">
                          <div className="flex-1 flex min-w-[80px] items-center justify-start pr-2">
                            <Arrow length={40} label="<100" isActive={isPathActive('sample-small')} />
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                                isPathActive('sample-small') ? `${getCategoryBackgroundColor('Limited Tested in Humans')} ${getCategoryBorderColor('Limited Tested in Humans')}` : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="flex items-center justify-center gap-1">
                                  <p className="text-xs font-semibold text-gray-700">Limited</p>
                                  <Info className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">{CATEGORY_DESCRIPTIONS['Limited Tested in Humans']}</p>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex items-center w-full mt-2">
                          <div className="flex-1 flex min-w-[80px] items-center justify-start pr-2">
                            <Arrow length={40} label="100-500K" isActive={isPathActive('sample-medium')} />
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                                isPathActive('sample-medium') ? `${getCategoryBackgroundColor('Tested in Humans')} ${getCategoryBorderColor('Tested in Humans')}` : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="flex items-center justify-center gap-1">
                                  <p className="text-xs font-semibold text-gray-700">Tested</p>
                                  <Info className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">{CATEGORY_DESCRIPTIONS['Tested in Humans']}</p>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex items-center w-full mt-2">
                          <div className="flex-1 flex min-w-[80px] items-center justify-start pr-2">
                            <Arrow length={40} label=">500K" isActive={isPathActive('sample-large')} />
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 cursor-pointer hover:opacity-80 ${
                                isPathActive('sample-large') ? `${getCategoryBackgroundColor('Widely Tested in Humans')} ${getCategoryBorderColor('Widely Tested in Humans')}` : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="flex items-center justify-center gap-1">
                                  <p className="text-xs font-semibold text-gray-700">Widely</p>
                                  <Info className="w-3 h-3 text-gray-500" />
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">{CATEGORY_DESCRIPTIONS['Widely Tested in Humans']}</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-start pt-16">
                      <Arrow length={40} label="Then" isActive={isPathActive('sample-small') || isPathActive('sample-medium') || isPathActive('sample-large')} />
                    </div>

                    {/* Column 7: Stance */}
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => handleNodeClick('stance')}
                        ref={stanceRef}
                        className={`w-[140px] h-[140px] p-4 rounded-xl border-2 transition-all duration-300 ${
                          isNodeActive('stance')
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                            : 'border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 opacity-60 hover:opacity-80'
                        }`}>
                        <div className="text-center h-full flex flex-col justify-center">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 mx-auto ${
                            isNodeActive('stance') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <span className="font-bold">7</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">Paper Stance</p>
                          <p className="text-xs mt-1 text-gray-500">{isNodeActive('stance') ? 'Click to conclude' : 'Click to view'}</p>
                        </div>
                      </button>

                      <div className="flex flex-col items-center w-full mt-6 space-y-3">
                        <Arrow length={40} label="Stance" direction="vertical" isActive={isPathActive('stance-supporting') || isPathActive('stance-contradicting')} />
                        <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                          stance ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <p className="text-xs font-semibold text-gray-700">
                            {stance || 'Supporting / Contradicting'}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Dialog for Questionnaire */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl">
                      {activeNode === 'validation' && 'Validation Screen'}
                      {activeNode === 'qualityCheck' && 'Quality Assessment'}
                      {activeNode === 'evidenceStrength' && 'Evidence Strength'}
                      {activeNode === 'human' && 'Human Study Assessment'}
                      {activeNode === 'studyTag' && 'Study Type'}
                      {activeNode === 'sample' && 'Sample Size Classification'}
                      {activeNode === 'stance' && 'Paper Stance'}
                    </DialogTitle>
                    <DialogDescription>
                      {activeNode === 'validation' && 'Check if any validation issues apply'}
                      {activeNode === 'qualityCheck' && 'Evaluate the study quality (all should pass)'}
                      {activeNode === 'evidenceStrength' && 'Assess whether the evidence is strong or weak'}
                      {activeNode === 'human' && 'Determine if the study was conducted in humans'}
                      {activeNode === 'studyTag' && 'Is this an observational study or a clinical trial?'}
                      {activeNode === 'sample' && 'Select the appropriate sample size range'}
                      {activeNode === 'stance' && 'Conclude whether the paper supports or contradicts the claim'}
                    </DialogDescription>
                    {((activeNode === 'validation' && currentStep !== 0) ||
                      (activeNode === 'qualityCheck' && currentStep !== 1) ||
                      (activeNode === 'evidenceStrength' && currentStep !== 2) ||
                      (activeNode === 'human' && currentStep !== 3) ||
                      (activeNode === 'studyTag' && currentStep !== 4) ||
                      (activeNode === 'sample' && currentStep !== 5) ||
                      (activeNode === 'stance' && currentStep !== 6)) && !classification && (
                      <div className="mt-2 p-2 bg-gray-100 rounded-lg text-center">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Preview Mode:</span> You can view the questions but cannot answer them yet.
                        </p>
                      </div>
                    )}
                    {classification && activeNode !== 'stance' && (
                      <div className="mt-2 p-2 bg-blue-100 rounded-lg text-center">
                        <p className="text-sm text-blue-700">
                          Workflow complete. Reset to try again.
                        </p>
                      </div>
                    )}
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {activeNode === 'validation' && (
                      <div>
                        <div className="space-y-4">
                          {validationQuestions.map((question) => (
                            <div key={question.id} className="py-2 px-3 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <p className="text-sm font-medium text-gray-800 mb-0">{question.label}</p>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleValidationAnswer(question.id, true)}
                                    disabled={currentStep !== 0 || classification !== null}
                                    className={`py-1 px-3 rounded-md border transition-all duration-200 text-sm ${
                                      validationAnswers[question.id] === true
                                        ? 'bg-red-50 text-red-700 font-medium border-red-500'
                                        : currentStep === 0 && !classification
                                        ? 'bg-white text-gray-700 hover:bg-red-50 cursor-pointer border-gray-300'
                                        : 'text-gray-400 opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                    }`}
                                  >Yes</button>
                                  <button
                                    onClick={() => handleValidationAnswer(question.id, false)}
                                    disabled={currentStep !== 0 || classification !== null}
                                    className={`py-1 px-3 rounded-md border transition-all duration-200 text-sm ${
                                      validationAnswers[question.id] === false
                                        ? 'bg-blue-50 text-blue-700 font-medium border-blue-500'
                                        : currentStep === 0 && !classification
                                        ? 'bg-white text-gray-700 hover:bg-blue-50 cursor-pointer border-gray-300'
                                        : 'text-gray-400 opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                    }`}
                                  >No</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {currentStep === 0 && !classification && (
                          <button
                            onClick={() => { proceedFromValidation(); setDialogOpen(false); }}
                            disabled={!canProceedFromValidation()}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                              canProceedFromValidation() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >Continue</button>
                        )}
                      </div>
                    )}

                    {activeNode === 'qualityCheck' && (
                      <div>
                        <div className="space-y-4">
                          {qualityCheckQuestions.map((question) => (
                            <div key={question.id} className="py-2 px-3 border-b border-gray-100">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                <p className="text-sm font-medium text-gray-800 mb-0">{question.label}</p>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleQualityCheckAnswer(question.id, true)}
                                    disabled={currentStep !== 1 || classification !== null}
                                    className={`py-1 px-3 rounded-md border transition-all duration-200 text-sm ${
                                      qualityCheckAnswers[question.id] === true
                                        ? 'bg-blue-50 text-blue-700 font-medium border-blue-500'
                                        : currentStep === 1 && !classification
                                        ? 'bg-white text-gray-700 hover:bg-blue-50 cursor-pointer border-gray-300'
                                        : 'text-gray-400 opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                    }`}
                                  >Yes</button>
                                  <button
                                    onClick={() => handleQualityCheckAnswer(question.id, false)}
                                    disabled={currentStep !== 1 || classification !== null}
                                    className={`py-1 px-3 rounded-md border transition-all duration-200 text-sm ${
                                      qualityCheckAnswers[question.id] === false
                                        ? 'bg-red-50 text-red-700 font-medium border-red-500'
                                        : currentStep === 1 && !classification
                                        ? 'bg-white text-gray-700 hover:bg-red-50 cursor-pointer border-gray-300'
                                        : 'text-gray-400 opacity-60 cursor-not-allowed border-gray-200 bg-gray-50'
                                    }`}
                                  >No</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {currentStep === 1 && !classification && (
                          <button
                            onClick={() => { proceedFromQualityCheck(); setDialogOpen(false); }}
                            disabled={!canProceedFromQualityCheck()}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                              canProceedFromQualityCheck() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >Continue</button>
                        )}
                      </div>
                    )}

                    {activeNode === 'evidenceStrength' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-4">
                          Evaluate whether the paper's evidence directly settles the claim being reviewed.
                        </p>
                        <div className="space-y-3">
                          {[
                            { value: 'strong', label: 'Strong', description: 'Statistically significant result that directly speaks to the claim — clear support or clear refutation.' },
                            { value: 'weak', label: 'Weak', description: 'Non-significant result, or gaps (wrong endpoint/population, underpowered, marginal effect) that prevent the paper from settling the claim.' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                if (currentStep === 2 && !classification) {
                                  setEvidenceStrength(option.value as 'strong' | 'weak');
                                }
                              }}
                              disabled={currentStep !== 2 || classification !== null}
                              className={`w-full p-3 text-left rounded-md transition-all duration-200 border ${
                                evidenceStrength === option.value
                                  ? 'bg-blue-50 border-blue-500'
                                  : currentStep === 2 && !classification
                                  ? 'border-gray-200 hover:bg-blue-50 cursor-pointer'
                                  : 'cursor-not-allowed opacity-60 border-gray-200'
                              }`}
                            >
                              <p className="font-medium text-gray-800">{option.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </button>
                          ))}
                        </div>
                        {evidenceStrength === 'weak' && currentStep === 2 && !classification && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800">Weak evidence routes this paper to <strong>Inconclusive</strong>.</p>
                          </div>
                        )}
                        {currentStep === 2 && !classification && (
                          <button
                            onClick={() => { proceedFromEvidenceStrength(); setDialogOpen(false); }}
                            disabled={!evidenceStrength}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                              evidenceStrength ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >Continue</button>
                        )}
                      </div>
                    )}

                    {activeNode === 'human' && (
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 text-center">
                          {steps[0].question}
                        </h3>
                        <div className="space-y-3">
                          {steps[0].options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (currentStep === 3 && !classification) {
                                  handleAnswer(option);
                                  setDialogOpen(false);
                                }
                              }}
                              disabled={currentStep !== 3 || classification !== null}
                              className={`w-full p-2 text-left rounded-md transition-all duration-200 group ${
                                currentStep === 3 && !classification ? 'hover:bg-blue-50 cursor-pointer border' : 'cursor-not-allowed opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-base md:text-lg font-medium ${currentStep === 3 && !classification ? 'text-gray-800 group-hover:text-blue-600' : 'text-gray-500'}`}>
                                  {option.label}
                                </span>
                                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${currentStep === 3 && !classification ? 'border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500' : 'border-gray-200 bg-gray-100'}`}></div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeNode === 'studyTag' && (
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 text-center">
                          {steps[1].question}
                        </h3>
                        {selectedStudyType && (
                          <div className="mb-4 text-center">
                            <span className="text-sm text-gray-600">Selected: </span>
                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStudyTagColor(selectedStudyType)} ${getStudyTagBorderColor(selectedStudyType)}`}>
                              {selectedStudyType}
                            </span>
                          </div>
                        )}
                        <div className="space-y-3">
                          {steps[1].options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (currentStep === 4 && !classification) {
                                  handleAnswer(option);
                                  setDialogOpen(false);
                                }
                              }}
                              disabled={currentStep !== 4 || classification !== null}
                              className={`w-full p-2 text-left rounded-md transition-all duration-200 group ${currentStep === 4 && !classification ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-not-allowed opacity-60'} ${selectedStudyType === option.value ? `${getStudyTagColor(option.value as 'Observational' | 'Clinical Trial')} ${getStudyTagBorderColor(option.value as 'Observational' | 'Clinical Trial')} shadow-md` : 'border border-gray-200'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-base md:text-lg font-medium ${selectedStudyType === option.value ? '' : currentStep === 4 && !classification ? 'text-gray-800 group-hover:text-blue-600' : 'text-gray-500'}`}>
                                  {option.label}
                                </span>
                                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                  selectedStudyType === option.value
                                    ? `${getStudyTagBorderColor(option.value as 'Observational' | 'Clinical Trial')} ${getStudyTagColor(option.value as 'Observational' | 'Clinical Trial')}`
                                    : currentStep === 4 && !classification ? 'border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500' : 'border-gray-200 bg-gray-100'
                                }`}></div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeNode === 'sample' && (
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 text-center">
                          {steps[2].question}
                        </h3>
                        <div className="space-y-3">
                          {steps[2].options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                if (currentStep === 5 && !classification) {
                                  handleAnswer(option);
                                  setDialogOpen(false);
                                }
                              }}
                              disabled={currentStep !== 5 || classification !== null}
                              className={`w-full p-2 text-left rounded-md transition-all duration-200 group ${
                                currentStep === 5 && !classification ? 'hover:bg-blue-50 cursor-pointer border' : 'cursor-not-allowed opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-base md:text-lg font-medium ${currentStep === 5 && !classification ? 'text-gray-800 group-hover:text-blue-600' : 'text-gray-500'}`}>
                                  {option.label}
                                </span>
                                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${currentStep === 5 && !classification ? 'border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500' : 'border-gray-200 bg-gray-100'}`}></div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeNode === 'stance' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-4">
                          After completing all prior steps, decide whether the paper's evidence is consistent with or runs against the claim.
                        </p>
                        <div className="space-y-3">
                          {[
                            { value: 'Supporting', label: 'Supporting', description: 'The paper\'s evidence is consistent with the claim.' },
                            { value: 'Contradicting', label: 'Contradicting', description: 'The paper\'s evidence runs against the claim.' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                if (currentStep === 6) {
                                  setStance(option.value as 'Supporting' | 'Contradicting');
                                }
                              }}
                              disabled={currentStep !== 6}
                              className={`w-full p-3 text-left rounded-md transition-all duration-200 border ${
                                stance === option.value
                                  ? 'bg-indigo-50 border-indigo-500'
                                  : currentStep === 6
                                  ? 'border-gray-200 hover:bg-indigo-50 cursor-pointer'
                                  : 'cursor-not-allowed opacity-60 border-gray-200'
                              }`}
                            >
                              <p className="font-medium text-gray-800">{option.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </button>
                          ))}
                        </div>
                        {currentStep === 6 && (
                          <button
                            onClick={() => { proceedFromStance(); setDialogOpen(false); }}
                            disabled={!stance}
                            className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                              stance ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >Finish</button>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Result Display */}
              {classification && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-[600px] mx-auto">
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Classification Result</h2>

                    <div className={`inline-block px-8 py-4 rounded-xl border-2 ${getCategoryBackgroundColor(classification)} ${getCategoryBorderColor(classification)}`}>
                      <p className="text-lg font-semibold">{classification}</p>
                    </div>

                    {selectedStudyType && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Study Type:</p>
                        <div className={`inline-block px-6 py-2 rounded-lg ${getStudyTagColor(selectedStudyType)} ${getStudyTagBorderColor(selectedStudyType)}`}>
                          <p className="text-base font-semibold">{selectedStudyType}</p>
                        </div>
                      </div>
                    )}

                    {stance && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Paper Stance:</p>
                        <div className={`inline-block px-6 py-2 rounded-lg border-2 ${stance === 'Supporting' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-red-50 border-red-400 text-red-800'}`}>
                          <p className="text-base font-semibold">{stance}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-gray-600 mt-6 max-w-md mx-auto">
                      {classification === 'Invalid' &&
                        'This publication has fundamental validity issues (conflict of interest or is a narrative review).'}
                      {classification === 'Inconclusive' &&
                        'This publication does not meet the quality criteria or evidence strength needed for further classification.'}
                      {classification === 'Not Tested in Humans' &&
                        'This study was not conducted in human subjects and requires further human research.'}
                      {classification === 'Limited Tested in Humans' &&
                        'This study has a small sample size and may need validation with larger populations.'}
                      {classification === 'Tested in Humans' &&
                        'This study has been conducted in a moderate human population with reasonable sample size.'}
                      {classification === 'Widely Tested in Humans' &&
                        'This study has been extensively tested in a large human population, providing robust evidence.'}
                    </p>

                    <button
                      onClick={resetWorkflow}
                      className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                      Classify Another Publication
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Methodology Section */}
            <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                About Our Classification System
              </h3>
              <div className="space-y-3 text-gray-600">
                <p>Our seven-step workflow ensures consistent and transparent evaluation of research publications:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Validation:</strong> Screens for fundamental issues — conflict of interest and narrative reviews</li>
                  <li><strong>Quality Checks:</strong> Evaluates study design, control groups, bias management, and statistical methods</li>
                  <li><strong>Evidence Strength:</strong> Determines if the result directly settles the claim (Strong → continue; Weak → Inconclusive)</li>
                  <li><strong>Human Study Verification:</strong> Confirms findings are applicable to human populations</li>
                  <li><strong>Study Type:</strong> Distinguishes observational studies from clinical trials</li>
                  <li><strong>Sample Size Classification:</strong> Assesses robustness and generalizability based on participant numbers</li>
                  <li><strong>Paper Stance:</strong> Reviewer concludes whether the paper supports or contradicts the claim</li>
                </ul>
              </div>
            </div>

            {/* Expert Review Process - Detailed Guidelines */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Full Review Process</h3>
              <p className="text-gray-700 mb-6">
                Each health and wellness claim submitted to Evidence Decoded is reviewed by one or more experts using this standardized workflow to ensure rigorous, transparent evaluation.
              </p>

              {/* Step 1: Validation */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">1</span>
                  Validation
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Identify fundamental issues that may invalidate the credibility of the research before deeper review.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
                  <p className="text-sm text-amber-900">
                    <strong>⚠️ Note:</strong> If any validation issue is found, the publication is marked as <strong>Invalid</strong> and further evaluation is not conducted.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <strong className="text-gray-900">Conflict of Interest:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Was the study funded by a company that would benefit from the results?</li>
                      <li>Do authors receive personal fees or own shares in such companies?</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Narrative Review:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Is this a narrative review, commentary, or editorial summarizing results across studies?</li>
                      <li>Not a primary research article — conclusions based on qualitative interpretation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2: Quality Assessment */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">2</span>
                  Quality Assessment
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Evaluate the methodological rigor of the study.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
                  <p className="text-sm text-amber-900">
                    <strong>⚠️ Note:</strong> If any quality criterion is not met, the publication is classified as <strong>Inconclusive</strong>.
                  </p>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <strong className="text-gray-900">Study Design:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Is the study design appropriate for the research question?</li>
                      <li>Are outcomes clearly defined and consistently measured?</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Control Group:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Are control or comparison groups present and properly selected?</li>
                      <li>May include wildtype, baseline, placebo, standard of care, or matched cohort</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Bias Addressed:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Were confounding variables identified and tracked?</li>
                      <li>Important factors like age, sex, comorbidities, and socioeconomic factors considered</li>
                      <li>Mitigation methods include randomization, blinding, balanced cohorts</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Statistics:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Were statistical tests appropriate for the study design and data type?</li>
                      <li>Are assumptions stated and checked?</li>
                      <li>Was multiple test correction applied?</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3: Evidence Strength */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">3</span>
                  Evidence Strength
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Determine whether the paper's findings directly settle the claim.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong className="text-gray-900">Strong:</strong> Statistically significant result that directly speaks to the claim — clear support or clear refutation of the specific assertion.</div>
                  <div><strong className="text-gray-900">Weak:</strong> Non-significant result, or gaps (wrong endpoint/population, underpowered, marginal effect) that prevent the paper from settling the claim either way.</div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-3">
                  <p className="text-sm text-blue-900">
                    Weak evidence forces the paper to <strong>Inconclusive</strong>. Strong evidence continues to the Human Study step.
                  </p>
                </div>
              </div>

              {/* Step 4: Human Study Verification */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">4</span>
                  Human Study Verification
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Determine whether findings are directly applicable to human populations.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong className="text-gray-900">Cell Culture:</strong> Studies using cell lines</div>
                  <div><strong className="text-gray-900">Animal Models:</strong> Studies using animal subjects</div>
                  <div><strong className="text-gray-900">Human Studies:</strong> Research conducted in human participants</div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-3">
                  <p className="text-sm text-blue-900">
                    Cell culture and animal model studies are categorized as <strong>Not Tested in Humans</strong> and require further human research.
                  </p>
                </div>
              </div>

              {/* Step 5: Study Type Classification */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">5</span>
                  Study Type Classification
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Categorize based on specific study design to guide interpretation of evidence strength.
                </p>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <strong className="text-gray-900">Study Tags:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li><strong>Observational Study:</strong> Researchers observe participants without intervention (cohort, case-control, cross-sectional studies)</li>
                      <li><strong>Clinical Trial:</strong> Experimental study with active intervention testing effectiveness and safety of treatments</li>
                      <li><strong>Women Not Included:</strong> Tracks gender representation when women/females were excluded</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-gray-900">Population Representation:</strong>
                    <ul className="list-disc ml-6 mt-1">
                      <li>Ethnicity of study participants</li>
                      <li>Age ranges of participants</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 6: Sample Size Classification */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">6</span>
                  Sample Size Classification
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Assess robustness and generalizability based on participant numbers.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong className="text-gray-900">Less than 100 participants:</strong> Limited Tested in Humans</div>
                  <div><strong className="text-gray-900">100 to 500,000 participants:</strong> Tested in Humans</div>
                  <div><strong className="text-gray-900">More than 500,000 participants:</strong> Widely Tested in Humans</div>
                </div>
              </div>

              {/* Step 7: Paper Stance */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-bold">7</span>
                  Paper Stance
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Objective:</strong> Conclude whether the paper's evidence supports or contradicts the claim being reviewed.
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong className="text-gray-900">Supporting:</strong> The paper's evidence is consistent with the claim.</div>
                  <div><strong className="text-gray-900">Contradicting:</strong> The paper's evidence runs against the claim.</div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-3">
                  <p className="text-sm text-blue-900">
                    Stance is determined by the reviewer at the end, based on all prior steps. It is not assigned at intake.
                  </p>
                </div>
              </div>

              {/* Expert Comments */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Expert Review Comments</h4>
                <p className="text-sm text-gray-700 mb-3">
                  After completing all seven steps, experts provide a comprehensive summary including:
                </p>
                <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
                  <li>Study overview: who/what is being tested, design (randomization, blinding, controls), overall conclusion</li>
                  <li>Classification rationale and limitations from each workflow step</li>
                  <li>Suggestions for improvement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearchWorkflow;
