import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Users, FileText, AlertCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { Arrow } from '../components/ui/arrow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '../components/layout/Header';

const ResearchWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<'validation' | 'qualityCheck' | 'human' | 'sample' | null>(null);
  const [validationAnswers, setValidationAnswers] = useState({
    hasConflict: false,
    isReview: false,
    isCategoricalMetaAnalysis: false,
    overstatesClaim: false
  });
  const [qualityCheckAnswers, setQualityCheckAnswers] = useState({
    studyDesign: true as boolean | true,
    controlGroup: true as boolean | true,
    biasAddressed: true as boolean | true,
    statistics: true as boolean | true
  });
  const [answers, setAnswers] = useState({});
  const [classification, setClassification] = useState(null);
  const [highlightPath, setHighlightPath] = useState([]);

  // refs to center the visual workflow on the active node
  const visualRef = useRef(null);
  const validationRef = useRef(null);
  const qualityCheckRef = useRef(null);
  const humanRef = useRef(null);
  const sampleRef = useRef(null);

  const validationQuestions = [
    { id: 'hasConflict', label: 'Does it have conflicts of interest?' },
    { id: 'isReview', label: 'Is this a review paper?' },
    { id: 'isCategoricalMetaAnalysis', label: 'Is this a categorical meta-analysis?' },
    { id: 'overstatesClaim', label: 'Does the claim overstate the evidence?' }
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
        { value: 'yes', label: 'Yes', next: 'sample' },
        { value: 'no', label: 'No', result: 'Not Tested in Humans' }
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
    setValidationAnswers({
      ...validationAnswers,
      [questionId]: answer
    });
  };

  const handleQualityCheckAnswer = (questionId, answer) => {
    setQualityCheckAnswers({
      ...qualityCheckAnswers,
      [questionId]: answer
    });
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
      // If overstates claim, it's Misinformation
      if (validationAnswers.overstatesClaim) {
        setClassification('Misinformation');
        setHighlightPath(['validation-misinformation']);
      } else {
        // Otherwise it's Invalid
        setClassification('Invalid');
        setHighlightPath(['validation-invalid']);
      }
    } else {
      // All validation checks passed, move to quality checks
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
      // All quality checks passed, move to human study question
      setCurrentStep(2);
      setHighlightPath(['validation-pass', 'qualityCheck-pass']);
    }
  };

  const handleAnswer = (option) => {
    const stepIndex = currentStep - 2; // Adjust for validation (0) and quality (1) steps
    const newAnswers = { ...answers, [steps[stepIndex].id]: option.value };
    setAnswers(newAnswers);

    const newPath = [...highlightPath, steps[stepIndex].id + '-' + option.value];
    setHighlightPath(newPath);

    if (option.result) {
      setClassification(option.result);
    } else if (option.next) {
      const nextStepIndex = steps.findIndex(s => s.id === option.next);
      setCurrentStep(nextStepIndex + 2); // +2 to account for validation and quality check steps
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(0);
    setValidationAnswers({
      hasConflict: false,
      isReview: false,
      isCategoricalMetaAnalysis: false,
      overstatesClaim: false
    });
    setQualityCheckAnswers({
      studyDesign: null,
      controlGroup: null,
      biasAddressed: null,
      statistics: null
    });
    setAnswers({});
    setClassification(null);
    setHighlightPath([]);
    setDialogOpen(false);
    setActiveNode(null);
  };

  const handleNodeClick = (node: 'validation' | 'qualityCheck' | 'human' | 'sample') => {
    // Only allow clicking on current active node or completed nodes
    if (node === 'validation' && currentStep === 0) {
      setActiveNode('validation');
      setDialogOpen(true);
    } else if (node === 'qualityCheck' && currentStep === 1) {
      setActiveNode('qualityCheck');
      setDialogOpen(true);
    } else if (node === 'human' && currentStep === 2) {
      setActiveNode('human');
      setDialogOpen(true);
    } else if (node === 'sample' && currentStep === 3) {
      setActiveNode('sample');
      setDialogOpen(true);
    }
  };

  const getClassificationColor = (classification) => {
    switch(classification) {
      case 'Misinformation':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'Invalid':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'Inconclusive':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'Not Tested in Humans':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'Limited Tested in Humans':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Tested in Humans':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'Widely Tested in Humans':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getClassificationIcon = (classification) => {
    switch(classification) {
      case 'Widely Tested in Humans':
        return <CheckCircle className="w-12 h-12" />;
      case 'Tested in Humans':
        return <Users className="w-12 h-12" />;
      case 'Limited Tested in Humans':
        return <AlertCircle className="w-12 h-12" />;
      case 'Not Tested in Humans':
        return <FileText className="w-12 h-12" />;
      case 'Invalid':
      case 'Misinformation':
      case 'Inconclusive':
        return <XCircle className="w-12 h-12" />;
      default:
        return <FileText className="w-12 h-12" />;
    }
  };

  const isNodeActive = (nodeId) => {
    if (currentStep === 0 && nodeId === 'validation') return true;
    if (currentStep === 1 && nodeId === 'qualityCheck') return true;
    if (classification) {
      return highlightPath.includes(nodeId);
    }
    if (nodeId === 'human' && currentStep === 2) return true;
    if (nodeId === 'sample' && currentStep === 3) return true;
    return false;
  };

  const isPathActive = (pathId) => {
    return highlightPath.includes(pathId);
  };

  const getTotalSteps = () => 4;
  const getCurrentStepNumber = () => {
    if (currentStep === 0) return 1;
    return currentStep + 1;
  };

  // Center the workflow visual container on the active node when step changes
  useEffect(() => {
    const container = visualRef.current;
    let targetEl = null;

    // Map currentStep to node ref: 0 => validation, 1 => qualityCheck, 2 => human, 3 => sample
    if (currentStep === 0) targetEl = validationRef.current;
    else if (currentStep === 1) targetEl = qualityCheckRef.current;
    else if (currentStep === 2) targetEl = humanRef.current;
    else if (currentStep === 3) targetEl = sampleRef.current;

    if (container && targetEl && typeof container.scrollTo === 'function') {
      // Use bounding rects to compute the target center relative to the container
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // center of target relative to container's scrollLeft
      const targetCenter = (targetRect.left - containerRect.left) + (targetRect.width / 2) + container.scrollLeft;
      const left = Math.max(0, Math.min(targetCenter - container.clientWidth / 2, container.scrollWidth - container.clientWidth));

      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [currentStep, highlightPath, classification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />

    <main className="pt-24 pb-16">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Research Publication Classification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Our workflow helps classify research publications based on study quality,
            population type, and sample size to provide clear evidence ratings.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Click on the highlighted steps to answer questions and progress through the workflow
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Visual Workflow - Full Width */}
          <div ref={visualRef} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-[1200px] mx-auto overflow-x-auto" >
            {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Step {getCurrentStepNumber()} of {getTotalSteps()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((getCurrentStepNumber() / getTotalSteps()) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }}
                    ></div>
                  </div>
                </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Workflow</h2>

            <div className="flex items-start justify-center gap-4 min-w-max">
              {/* Column 1: Validation Screen */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleNodeClick('validation')}
                  disabled={currentStep !== 0 || classification !== null}
                  ref={validationRef}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  isNodeActive('validation')
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                    : 'border-gray-200 bg-white cursor-not-allowed opacity-60'
                }`}>
                  <div className="text-center  min-h-[90px]">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                      isNodeActive('validation') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <span className="font-bold">1</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Validation</p>
                    {isNodeActive('validation') && (
                      <p className="text-xs text-blue-600 mt-1">Click to answer</p>
                    )}
                  </div>
                </button>

                {/* Outcomes from Validation */}
                <div className="flex flex-col items-center w-full mt-6 space-y-3">
                  <div className="flex items-center w-full">
                    <div className="flex-1 flex items-center justify-center pr-2">
                    <Arrow length={40} label="Any yes" direction="vertical" isActive={isPathActive('validation-invalid') || isPathActive('validation-misinformation')}  />
                    </div>
                  </div>

                  <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                    isPathActive('validation-invalid') || isPathActive('validation-misinformation') ? 'border-red-400 bg-red-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Invalid/Misinfo</p>
                  </div>
                </div>
              </div>

              {/* Arrow between columns */}
              <div className="flex flex-col items-center justify-start pt-16">
                <div className="flex items-center">
                  <Arrow length={40} label="All No" isActive={isPathActive('validation-pass')}  />
                </div>
              </div>

              {/* Column 2: Quality Checks */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleNodeClick('qualityCheck')}
                  disabled={currentStep !== 1 || classification !== null}
                  ref={qualityCheckRef}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  isNodeActive('qualityCheck')
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                    : 'border-gray-200 bg-white cursor-not-allowed opacity-60'
                }`}>
                  <div className="text-center  min-h-[90px]">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                      isNodeActive('qualityCheck') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <span className="font-bold">2</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Quality Checks</p>
                    {isNodeActive('qualityCheck') && (
                      <p className="text-xs text-blue-600 mt-1">Click to answer</p>
                    )}
                  </div>
                </button>

                {/* Outcomes from Quality Checks */}
                <div className="flex flex-col items-center w-full mt-6 space-y-3">
                  <div className="flex items-center w-full">
                    <div className="flex-1 flex items-center justify-center pr-2">
                    <Arrow length={40} label="Any No" direction="vertical" isActive={isPathActive('qualityCheck-no')}  />
                    </div>
                  </div>

                  <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                    isPathActive('qualityCheck-no') ? 'border-gray-400 bg-gray-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Inconclusive</p>
                  </div>
                </div>
              </div>

              {/* Arrow between columns */}
              <div className="flex flex-col items-center justify-start pt-16">
                <div className="flex items-center">
                  <Arrow length={40} label="All Pass" isActive={isPathActive('qualityCheck-pass')}  />
                </div>
              </div>

              {/* Column 3: Human Study */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleNodeClick('human')}
                  disabled={currentStep !== 2 || classification !== null}
                  ref={humanRef}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  isNodeActive('human')
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                    : 'border-gray-200 bg-white cursor-not-allowed opacity-60'
                }`}>
                  <div className="text-center  min-h-[90px]">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                      isNodeActive('human') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <span className="font-bold">3</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Human Study?</p>
                    {isNodeActive('human') && (
                      <p className="text-xs text-blue-600 mt-1">Click to answer</p>
                    )}
                  </div>
                </button>

                {/* Outcomes from Human */}
                <div className="flex flex-col items-center w-full mt-6 space-y-3">
                  <div className="flex items-center w-full ">
                    <div className="flex-1 flex items-center justify-center pr-2">
                      {/* <span className="text-xs text-gray-500">No</span>
                      <ArrowDown className={`w-5 h-5 transition-all duration-300 ${
                      isPathActive('human-no') ? 'text-blue-500' : 'text-gray-300'
                    }`} /> */}
                    <Arrow length={40} label="No" direction="vertical" isActive={isPathActive('human-no')}  />

                    </div>

                  </div>

                  <div className={`w-full p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('human-no') ? 'border-orange-400 bg-orange-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Not Tested</p>
                  </div>
                </div>
              </div>

              {/* Arrow between columns */}
              <div className="flex flex-col items-center justify-start pt-16">
                <div className="flex items-center">
                  {/* <span className="text-xs text-gray-500 mr-2">Yes</span> */}
                  {/* <ArrowRight className={`w-6 h-6 transition-all duration-300 ${
                    isPathActive('human-yes') ? 'text-blue-500' : 'text-gray-300'
                  }`} /> */}
                  <Arrow length={50} label="Yes" isActive={isPathActive('human-yes')}  />
                </div>
              </div>

              {/* Column 4: Sample Size */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleNodeClick('sample')}
                  disabled={currentStep !== 3 || classification !== null}
                  ref={sampleRef}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  isNodeActive('sample')
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 cursor-pointer hover:shadow-xl'
                    : 'border-gray-200 bg-white cursor-not-allowed opacity-60'
                }`}>
                  <div className="text-center  min-h-[90px] ">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                      isNodeActive('sample') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <span className="font-bold">4</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Sample Size</p>
                    {isNodeActive('sample') && (
                      <p className="text-xs text-blue-600 mt-1">Click to answer</p>
                    )}
                  </div>
                </button>
              </div>
              {/* Column 5: Outcomes from Sample Size */}
              <div className="flex flex-col items-center flex-2">
                <div className="flex flex-col items-center w-full mt-6 space-y-3">
                  <div className="flex items-center w-full">
                    <div className="flex-1 flex min-w-[80px] items-center justify-start pr-2">
                      {/* <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                      isPathActive('sample-small') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                      <span className="text-xs text-gray-500">&lt;100</span> */}
                      <Arrow length={40} label="100" isActive={isPathActive('sample-small')}  />
                    </div>
                    <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                      isNodeActive('sample-small') ? 'border-yellow-400 bg-yellow-100 shadow-md' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <p className="text-xs font-semibold text-gray-700">Limited</p>
                    </div>
                  </div>

                  <div className="flex items-center w-full mt-2">
                    <div className="flex-1 flex  min-w-[80px] items-center justify-start pr-2">
                    {/* <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                      isPathActive('sample-medium') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                      <span className="text-xs text-gray-500">100-500K</span> */}
                      <Arrow length={40} label="100-500K" isActive={isPathActive('sample-medium')}  />
                    </div>


                  <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('sample-medium') ? 'border-blue-400 bg-blue-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Tested</p>
                  </div>
                  </div>

                  <div className="flex items-center w-full mt-2">
                    <div className="flex-1 flex  min-w-[80px]  items-center justify-start pr-2">
                      {/* <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                      isPathActive('sample-large') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                      <span className="text-xs text-gray-500">&gt;500K</span> */}
                      <Arrow length={40} label="&gt;500K" isActive={isPathActive('sample-large')}  />
                    </div>
                    <div className={`w-full p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('sample-large') ? 'border-green-400 bg-green-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                      <p className="text-xs font-semibold text-gray-700">Widely</p>
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
                <DialogTitle className="text-2xl">
                  {activeNode === 'validation' && 'Validation Screen'}
                  {activeNode === 'qualityCheck' && 'Quality Assessment'}
                  {activeNode === 'human' && 'Human Study Assessment'}
                  {activeNode === 'sample' && 'Sample Size Classification'}
                </DialogTitle>
                <DialogDescription>
                  {activeNode === 'validation' && 'Check if any validation issues apply'}
                  {activeNode === 'qualityCheck' && 'Evaluate the study quality (all should pass)'}
                  {activeNode === 'human' && 'Determine if the study was conducted in humans'}
                  {activeNode === 'sample' && 'Select the appropriate sample size range'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {activeNode === 'validation' && (
                  <div>
                    <div className="space-y-4">
                      {validationQuestions.map((question) => (
                        <div key={question.id} className="p-4 border-2 border-gray-200 rounded-xl">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-gray-800 mb-0">
                              {question.label}
                            </p>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleValidationAnswer(question.id, true)}
                                className={`py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                  validationAnswers[question.id] === true
                                    ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => handleValidationAnswer(question.id, false)}
                                className={`py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                  validationAnswers[question.id] === false
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        proceedFromValidation();
                        setDialogOpen(false);
                      }}
                      disabled={!canProceedFromValidation()}
                      className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                        canProceedFromValidation()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {activeNode === 'qualityCheck' && (
                  <div>
                    <div className="space-y-4">
                      {qualityCheckQuestions.map((question) => (
                        <div key={question.id} className="p-4 border-2 border-gray-200 rounded-xl">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-medium text-gray-800 mb-0">
                              {question.label}
                            </p>

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleQualityCheckAnswer(question.id, true)}
                                className={`py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                  qualityCheckAnswers[question.id] === true
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => handleQualityCheckAnswer(question.id, false)}
                                className={`py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                  qualityCheckAnswers[question.id] === false
                                    ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        proceedFromQualityCheck();
                        setDialogOpen(false);
                      }}
                      disabled={!canProceedFromQualityCheck()}
                      className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                        canProceedFromQualityCheck()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {activeNode === 'human' && currentStep === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      {steps[0].question}
                    </h3>
                    <div className="space-y-3">
                      {steps[0].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleAnswer(option);
                            setDialogOpen(false);
                          }}
                          className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-800 group-hover:text-blue-600">
                              {option.label}
                            </span>
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all duration-200"></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeNode === 'sample' && currentStep === 3 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      {steps[1].question}
                    </h3>
                    <div className="space-y-3">
                      {steps[1].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            handleAnswer(option);
                            setDialogOpen(false);
                          }}
                          className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-medium text-gray-800 group-hover:text-blue-600">
                              {option.label}
                            </span>
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all duration-200"></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Result Display */}
          {classification && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-[600px] mx-auto">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Classification Result
                </h2>

                <div className={`inline-block px-8 py-4 rounded-xl border-2 ${getClassificationColor(classification)}`}>
                  <p className="text-lg font-semibold">
                    {classification}
                  </p>
                </div>

                <p className="text-gray-600 mt-6 max-w-md mx-auto">
                  {classification === 'Misinformation' &&
                    'This publication overstates or misinterprets the evidence from the study.'}
                  {classification === 'Invalid' &&
                    'This publication has fundamental validity issues (conflicts of interest, review study, or categorical meta-analysis).'}
                  {classification === 'Inconclusive' &&
                    'This publication does not meet the quality criteria for further classification.'}
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
            <p>
              Our four-step workflow ensures consistent and transparent evaluation of research publications:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Validation:</strong> Screens for fundamental issues like conflicts of interest, review studies, categorical meta-analyses, and evidence overstatement</li>
              <li><strong>Quality Checks:</strong> Evaluates study design, control groups, bias management, and statistical methods</li>
              <li><strong>Human Study Verification:</strong> Confirms findings are applicable to human populations</li>
              <li><strong>Sample Size Classification:</strong> Assesses the robustness and generalizability based on participant numbers</li>
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
