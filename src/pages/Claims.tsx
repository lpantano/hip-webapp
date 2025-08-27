import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronUp, ExternalLink, Users, Info, Heart, Eye, BookOpen, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Claims {
  id: string;
  claim: string;
  product: string;
  category: 'medicine' | 'supplement' | 'food' | 'exercise' | 'diet' | 'service';
  condition: string;
  stage: string;
  votes: number;
  publications: {
    title: string;
    authors: string;
    journal: string;
    year: number;
    url: string;
    scores: {
      sampleSize: {
        score: 'low' | 'medium' | 'high';
        explanation: string;
      };
      populationRepresentation: {
        score: 'low' | 'medium' | 'high';
        explanation: string;
      };
      consensus: {
        score: 'low' | 'medium' | 'high';
        explanation: string;
      };
      evidence: {
        score: 'low' | 'medium' | 'high';
        explanation: string;
      };
    };
  }[];
  status: 'pending' | 'under_review' | 'approved';
}

// Placeholder data - will come from database later
const placeholderClaims: Claims[] = [
  {
    id: '1',
    claim: 'Turmeric reduces inflammation and joint pain during perimenopause',
    product: 'Turmeric (Curcumin)',
    category: 'supplement',
    condition: 'Joint Pain',
    stage: 'Perimenopause',
    votes: 156,
    publications: [
      {
        title: 'Curcumin: A Review of Its Effects on Human Health',
        authors: 'Hewlings SJ, Kalman DS',
        journal: 'Foods',
        year: 2017,
        url: 'https://pubmed.ncbi.nlm.nih.gov/28914794/',
        scores: {
          sampleSize: {
            score: 'high',
            explanation: 'Meta-analysis including 11 studies with over 1,500 participants total'
          },
          populationRepresentation: {
            score: 'medium',
            explanation: 'Studies included diverse populations but limited representation of perimenopausal women specifically'
          },
          consensus: {
            score: 'high',
            explanation: 'Strong consensus across multiple studies showing anti-inflammatory benefits'
          },
          evidence: {
            score: 'medium',
            explanation: 'Good evidence for anti-inflammatory effects, but specific perimenopause benefits need more research'
          }
        }
      },
      {
        title: 'Anti-inflammatory effects of curcumin in menopausal women',
        authors: 'Smith A, Johnson B',
        journal: 'Menopause Research',
        year: 2023,
        url: 'https://example.com/study2',
        scores: {
          sampleSize: {
            score: 'low',
            explanation: 'Small study with only 45 participants'
          },
          populationRepresentation: {
            score: 'high',
            explanation: 'Specifically focused on perimenopausal women aged 45-55'
          },
          consensus: {
            score: 'low',
            explanation: 'Limited number of studies on this specific population'
          },
          evidence: {
            score: 'medium',
            explanation: 'Showed significant reduction in inflammatory markers in target population'
          }
        }
      }
    ],
    status: 'pending'
  },
  {
    id: '2',
    claim: 'Regular yoga practice improves mood and reduces anxiety during menopause',
    product: 'Yoga',
    category: 'exercise',
    condition: 'Anxiety & Mood',
    stage: 'Menopause',
    votes: 203,
    publications: [
      {
        title: 'Yoga for menopausal symptoms: A systematic review',
        authors: 'Cramer H, Lauche R, Langhorst J',
        journal: 'Maturitas',
        year: 2012,
        url: 'https://pubmed.ncbi.nlm.nih.gov/22377186/',
        scores: {
          sampleSize: {
            score: 'high',
            explanation: 'Systematic review of 13 studies with over 1,300 participants'
          },
          populationRepresentation: {
            score: 'high',
            explanation: 'Studies included diverse menopausal populations across different countries'
          },
          consensus: {
            score: 'high',
            explanation: 'Strong consensus across reviewed studies for yoga benefits on mood and anxiety'
          },
          evidence: {
            score: 'high',
            explanation: 'Consistent evidence showing significant improvements in anxiety and mood scores'
          }
        }
      }
    ],
    status: 'pending'
  },
  {
    id: '3',
    claim: 'Omega-3 fatty acids reduce hot flashes and night sweats',
    product: 'Fish Oil Supplements',
    category: 'supplement',
    condition: 'Hot Flashes',
    stage: 'Menopause',
    votes: 89,
    publications: [
      {
        title: 'Omega-3 fatty acids and menopausal symptoms',
        authors: 'Lucas M, Asselin G, Mérette C',
        journal: 'Menopause',
        year: 2009,
        url: 'https://pubmed.ncbi.nlm.nih.gov/19593153/',
        scores: {
          sampleSize: {
            score: 'medium',
            explanation: 'Cross-sectional study with 120 participants'
          },
          populationRepresentation: {
            score: 'medium',
            explanation: 'Canadian women aged 45-55, limited geographic diversity'
          },
          consensus: {
            score: 'low',
            explanation: 'Limited studies on omega-3 for hot flashes, mixed results in literature'
          },
          evidence: {
            score: 'low',
            explanation: 'Modest correlation found, but causation not established'
          }
        }
      }
    ],
    status: 'under_review'
  },
  {
    id: '4',
    claim: 'Mediterranean diet supports bone health in postmenopausal women',
    product: 'Mediterranean Diet',
    category: 'diet',
    condition: 'Bone Health',
    stage: 'Postmenopause',
    votes: 134,
    publications: [
      {
        title: 'Mediterranean diet and bone density in postmenopausal women',
        authors: 'Feart C, Lorrain S, Ginder Coupez V',
        journal: 'Osteoporosis International',
        year: 2013,
        url: 'https://pubmed.ncbi.nlm.nih.gov/23161090/',
        scores: {
          sampleSize: {
            score: 'high',
            explanation: 'Large cohort study with 1,482 postmenopausal women'
          },
          populationRepresentation: {
            score: 'medium',
            explanation: 'French cohort, limited ethnic diversity but good age representation'
          },
          consensus: {
            score: 'high',
            explanation: 'Multiple studies consistently show Mediterranean diet benefits for bone health'
          },
          evidence: {
            score: 'high',
            explanation: 'Strong statistical association between diet adherence and bone mineral density'
          }
        }
      }
    ],
    status: 'approved'
  },
  {
    id: '5',
    claim: 'Black cohosh may help reduce hot flash frequency and intensity',
    product: 'Black Cohosh',
    category: 'supplement',
    condition: 'Hot Flashes',
    stage: 'Menopause',
    votes: 67,
    publications: [
      {
        title: 'Black cohosh for menopausal symptoms: A systematic review',
        authors: 'Leach MJ, Moore V',
        journal: 'Cochrane Database',
        year: 2012,
        url: 'https://pubmed.ncbi.nlm.nih.gov/22895933/',
        scores: {
          sampleSize: {
            score: 'medium',
            explanation: 'Systematic review of 16 studies with varying sample sizes (50-304 participants each)'
          },
          populationRepresentation: {
            score: 'medium',
            explanation: 'Studies from multiple countries but predominantly Western populations'
          },
          consensus: {
            score: 'low',
            explanation: 'Mixed results across studies, some showing benefit while others show no effect'
          },
          evidence: {
            score: 'low',
            explanation: 'Insufficient evidence to determine effectiveness due to study quality limitations'
          }
        }
      }
    ],
    status: 'pending'
  }
];

const Claims = () => {
  const [claims, setClaims] = useState<Claims[]>(placeholderClaims);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  const handleVote = (id: string) => {
    setClaims(prev => 
      prev.map(claim => 
        claim.id === id 
          ? { ...claim, votes: claim.votes + 1 }
          : claim
      )
    );
  };

  const handleReaction = (claimId: string, reactionType: string) => {
    setReactions(prev => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        [reactionType]: (prev[claimId]?.[reactionType] || 0) + 1
      }
    }));
  };

  const getReactionCount = (claimId: string, reactionType: string) => {
    return reactions[claimId]?.[reactionType] || 0;
  };

  const reactionButtons = [
    { type: 'helpful', icon: Heart, label: 'Helpful', color: 'text-pink-600' },
    { type: 'eyeopening', icon: Eye, label: 'Eye-opening', color: 'text-blue-600' },
    { type: 'wantmore', icon: BookOpen, label: 'Want more', color: 'text-green-600' },
    { type: 'moneysaver', icon: DollarSign, label: 'Money saver', color: 'text-yellow-600' }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      medicine: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      supplement: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      exercise: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      diet: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      service: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[score];
  };

  const sortedClaims = [...claims].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    return 0; // For 'recent' we'd sort by date when we have real data
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="max-w-4xl mx-auto mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Claims for Review
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Community-driven claims about products and services for women's health conditions. 
              Upvote Claims with strong scientific backing to prioritize them for expert review.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>All Claims must be linked to scientific publications</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'votes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('votes')}
                >
                  Sort by Votes
                </Button>
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Most Recent
                </Button>
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="max-w-4xl mx-auto space-y-6">
            {sortedClaims.map((claim) => (
              <Card key={claim.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getCategoryColor(claim.category)}>
                          {claim.category}
                        </Badge>
                        <Badge variant="outline">
                          {claim.condition}
                        </Badge>
                        <Badge variant="outline">
                          {claim.stage}
                        </Badge>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{claim.claim}</CardTitle>
                      <CardDescription className="text-base">
                        Product: <span className="font-medium text-foreground">{claim.product}</span>
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(claim.id)}
                        className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
                      >
                        <ChevronUp className="w-4 h-4" />
                        {claim.votes}
                      </Button>
                      
                      {/* Reaction buttons */}
                      <div className="flex flex-col gap-1 mt-2">
                        {reactionButtons.map((reaction) => {
                          const count = getReactionCount(claim.id, reaction.type);
                          const Icon = reaction.icon;
                          return (
                            <Button
                              key={reaction.type}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs justify-start"
                              onClick={() => handleReaction(claim.id, reaction.type)}
                              title={reaction.label}
                            >
                              <Icon className={`w-3 h-3 mr-1 ${reaction.color}`} />
                              <span className="text-xs">{count > 0 && count}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                      Supporting Publications
                    </h4>
                    <div className="space-y-3">
                      {claim.publications.map((pub, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm mb-1">{pub.title}</h5>
                              <p className="text-xs text-muted-foreground mb-1">
                                {pub.authors} • {pub.journal} ({pub.year})
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="shrink-0"
                            >
                              <a 
                                href={pub.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View
                              </a>
                            </Button>
                          </div>
                          
                          {/* Score Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Sample Size:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.sampleSize.score)} variant="outline">
                                      {pub.scores.sampleSize.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Sample Size Score</div>
                                     <p>{pub.scores.sampleSize.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Population:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.populationRepresentation.score)} variant="outline">
                                      {pub.scores.populationRepresentation.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Population Representation</div>
                                     <p>{pub.scores.populationRepresentation.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Consensus:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.consensus.score)} variant="outline">
                                      {pub.scores.consensus.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Research Consensus</div>
                                     <p>{pub.scores.consensus.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Evidence:</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer">
                                    <Badge className={getScoreColor(pub.scores.evidence.score)} variant="outline">
                                      {pub.scores.evidence.score}
                                    </Badge>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                  </div>
                                </PopoverTrigger>
                                 <PopoverContent className="w-64 text-sm">
                                   <div className="space-y-3">
                                     <div className="font-medium">Evidence Quality</div>
                                     <p>{pub.scores.evidence.explanation}</p>
                                   </div>
                                 </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Want to Submit an Claims?</h3>
                <p className="text-muted-foreground mb-6">
                  Have a claim backed by scientific research? Submit it for community review and expert evaluation.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Submit Claims
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Claims;