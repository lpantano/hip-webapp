import React, { useState } from 'react';
import { CheckCircle, XCircle, Users, FileText, AlertCircle, ArrowDown } from 'lucide-react';

const ResearchWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [qualityAnswers, setQualityAnswers] = useState({
    isReview: null,
    isQualitative: null,
    hasConflict: null,
    overstatesClaim: null
  });
  const [answers, setAnswers] = useState({});
  const [classification, setClassification] = useState(null);
  const [highlightPath, setHighlightPath] = useState([]);

  const qualityQuestions = [
    { id: 'isReview', label: 'Is this a review paper?' },
    { id: 'isQualitative', label: 'Is this a qualitative study?' },
    { id: 'hasConflict', label: 'Does it have conflicts of interest?' },
    { id: 'overstatesClaim', label: 'Does the claim overstate the evidence?' }
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

  const handleQualityAnswer = (questionId, answer) => {
    setQualityAnswers({
      ...qualityAnswers,
      [questionId]: answer
    });
  };

  const canProceedFromQuality = () => {
    return Object.values(qualityAnswers).every(answer => answer !== null);
  };

  const proceedFromQuality = () => {
    const hasAnyYes = Object.values(qualityAnswers).some(answer => answer === true);

    if (hasAnyYes) {
      setClassification('Inconclusive');
      setHighlightPath(['quality-yes']);
    } else {
      setCurrentStep(1);
      setHighlightPath(['quality-no']);
    }
  };

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [steps[currentStep - 1].id]: option.value };
    setAnswers(newAnswers);

    const newPath = [...highlightPath, steps[currentStep - 1].id + '-' + option.value];
    setHighlightPath(newPath);

    if (option.result) {
      setClassification(option.result);
    } else if (option.next) {
      const nextStepIndex = steps.findIndex(s => s.id === option.next);
      setCurrentStep(nextStepIndex + 1);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep(0);
    setQualityAnswers({
      isReview: null,
      isQualitative: null,
      hasConflict: null,
      overstatesClaim: null
    });
    setAnswers({});
    setClassification(null);
    setHighlightPath([]);
  };

  const getClassificationColor = (classification) => {
    switch(classification) {
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
      case 'Inconclusive':
        return <XCircle className="w-12 h-12" />;
      default:
        return <FileText className="w-12 h-12" />;
    }
  };

  const isNodeActive = (nodeId) => {
    if (currentStep === 0 && nodeId === 'quality') return true;
    if (classification) {
      return highlightPath.includes(nodeId);
    }
    if (nodeId === 'human' && currentStep === 1) return true;
    if (nodeId === 'sample' && currentStep === 2) return true;
    return false;
  };

  const isPathActive = (pathId) => {
    return highlightPath.includes(pathId);
  };

  const getTotalSteps = () => 3;
  const getCurrentStepNumber = () => {
    if (currentStep === 0) return 1;
    return currentStep + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Research Publication Classification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our workflow helps classify research publications based on study quality,
            population type, and sample size to provide clear evidence ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Workflow */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Workflow Visualization</h2>

            <div className="flex flex-col items-center space-y-4">
              {/* Step 1: Quality Check */}
              <div className={`w-full max-w-sm p-4 rounded-xl border-2 transition-all duration-300 ${
                isNodeActive('quality') ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white'
              }`}>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                    isNodeActive('quality') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="font-bold">1</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Quality Screen</p>
                </div>
              </div>

              {/* Arrows from Quality */}
              <div className="flex items-start justify-center w-full gap-8">
                <div className="flex flex-col items-center flex-1">
                  <ArrowDown className={`w-6 h-6 transition-all duration-300 ${
                    isPathActive('quality-yes') ? 'text-blue-500' : 'text-gray-300'
                  }`} />
                  <span className="text-xs text-gray-500 mt-1">Any Yes</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <ArrowDown className={`w-6 h-6 transition-all duration-300 ${
                    isPathActive('quality-no') ? 'text-blue-500' : 'text-gray-300'
                  }`} />
                  <span className="text-xs text-gray-500 mt-1">All No</span>
                </div>
              </div>

              {/* Results Row 1 */}
              <div className="flex items-center justify-center w-full gap-8">
                <div className={`flex-1 p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                  isNodeActive('quality-yes') ? 'border-gray-400 bg-gray-100 shadow-md' : 'border-gray-200 bg-gray-50'
                }`}>
                  <p className="text-xs font-semibold text-gray-700">Inconclusive</p>
                </div>

                {/* Step 2: Human Study */}
                <div className={`flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${
                  isNodeActive('human') ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white'
                }`}>
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                      isNodeActive('human') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">Human Study?</p>
                  </div>
                </div>
              </div>

              {/* Arrows from Human */}
              <div className="flex items-start justify-end w-full gap-8 pr-0">
                <div className="flex flex-col items-center flex-1 invisible">
                  <ArrowDown className="w-6 h-6 text-gray-300" />
                </div>
                <div className="flex items-start justify-center gap-8 flex-1">
                  <div className="flex flex-col items-center">
                    <ArrowDown className={`w-6 h-6 transition-all duration-300 ${
                      isPathActive('human-no') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500 mt-1">No</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowDown className={`w-6 h-6 transition-all duration-300 ${
                      isPathActive('human-yes') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500 mt-1">Yes</span>
                  </div>
                </div>
              </div>

              {/* Results Row 2 */}
              <div className="flex items-center justify-end w-full gap-8">
                <div className="flex-1 invisible"></div>
                <div className="flex items-center justify-center gap-8 flex-1">
                  <div className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('human-no') ? 'border-orange-400 bg-orange-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Not Tested</p>
                  </div>

                  {/* Step 3: Sample Size */}
                  <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    isNodeActive('sample') ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-1 ${
                        isNodeActive('sample') ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <p className="text-xs font-medium text-gray-700">Sample Size</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrows from Sample */}
              <div className="flex items-start justify-end w-full">
                <div className="flex-1 invisible"></div>
                <div className="flex items-start justify-center gap-4 flex-1">
                  <div className="flex flex-col items-center">
                    <ArrowDown className={`w-5 h-5 transition-all duration-300 ${
                      isPathActive('sample-small') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500 mt-1">&lt;100</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowDown className={`w-5 h-5 transition-all duration-300 ${
                      isPathActive('sample-medium') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500 mt-1">100-500K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowDown className={`w-5 h-5 transition-all duration-300 ${
                      isPathActive('sample-large') ? 'text-blue-500' : 'text-gray-300'
                    }`} />
                    <span className="text-xs text-gray-500 mt-1">&gt;500K</span>
                  </div>
                </div>
              </div>

              {/* Final Results Row */}
              <div className="flex items-center justify-end w-full">
                <div className="flex-1 invisible"></div>
                <div className="flex items-center justify-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('sample-small') ? 'border-yellow-400 bg-yellow-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Limited</p>
                  </div>
                  <div className={`p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('sample-medium') ? 'border-blue-400 bg-blue-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Tested</p>
                  </div>
                  <div className={`p-2 rounded-lg border-2 text-center transition-all duration-300 ${
                    isNodeActive('sample-large') ? 'border-green-400 bg-green-100 shadow-md' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <p className="text-xs font-semibold text-gray-700">Widely</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Questions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {!classification ? (
              <div className="space-y-6">
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

                {currentStep === 0 ? (
                  /* Quality Questions */
                  <div>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <span className="text-xl font-bold text-blue-600">1</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Quality Screen
                      </h2>
                      <p className="text-sm text-gray-600">
                        Answer all questions below
                      </p>
                    </div>

                    <div className="space-y-4">
                      {qualityQuestions.map((question) => (
                        <div key={question.id} className="p-4 border-2 border-gray-200 rounded-xl">
                          <p className="text-sm font-medium text-gray-800 mb-3">
                            {question.label}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleQualityAnswer(question.id, true)}
                              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                qualityAnswers[question.id] === true
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleQualityAnswer(question.id, false)}
                              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all duration-200 ${
                                qualityAnswers[question.id] === false
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                              }`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={proceedFromQuality}
                      disabled={!canProceedFromQuality()}
                      className={`w-full mt-6 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                        canProceedFromQuality()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  /* Regular Question */
                  <div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <span className="text-xl font-bold text-blue-600">
                          {currentStep + 1}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {steps[currentStep - 1].question}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {steps[currentStep - 1].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(option)}
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
            ) : (
              /* Result */
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className={`p-6 rounded-full ${getClassificationColor(classification)}`}>
                    {getClassificationIcon(classification)}
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Classification Result
                </h2>

                <div className={`inline-block px-8 py-4 rounded-xl border-2 ${getClassificationColor(classification)}`}>
                  <p className="text-2xl font-semibold">
                    {classification}
                  </p>
                </div>

                <p className="text-gray-600 mt-6 max-w-md mx-auto">
                  {classification === 'Inconclusive' &&
                    'This publication does not meet the initial quality criteria for further classification.'}
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
            )}
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            About Our Classification System
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              Our three-step workflow ensures consistent and transparent evaluation of research publications:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Initial quality screening filters out reviews, qualitative studies, papers with conflicts of interest, and overstated claims</li>
              <li>Human study verification ensures findings are applicable to human populations</li>
              <li>Sample size classification helps assess the robustness and generalizability of findings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchWorkflow;
