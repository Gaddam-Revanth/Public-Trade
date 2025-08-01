'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Vote, CheckCircle, XCircle, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react'

interface Proposal {
  id: string
  title: string
  description: string
  options: string[]
  deadline: string
  createdAt: string
  totalVotes: number
  status: 'active' | 'closed'
}

interface VoteData {
  proposal: string
  totalVotes: number
  yesVotes: number
  noVotes: number
  yesPercentage: number
  noPercentage: number
  votes: Array<{
    id: string
    user: {
      id: string
      name?: string
      email: string
    }
    decision: boolean
    createdAt: string
  }>
}

export function VotingSystem() {
  const [demoUser, setDemoUser] = useState({
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
  });
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    loadProposals()
  }, [])

  useEffect(() => {
    if (selectedProposal) {
      loadVoteData(selectedProposal.id)
    }
  }, [selectedProposal])

  const loadProposals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/votes')
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals)
        
        // Load user's voting history
        // Simulate user's voting history for demo
        const userVoteData: Record<string, boolean> = {};
        // Example: Mark first proposal as voted 'yes'
        if (data.proposals.length > 0) {
          userVoteData[data.proposals[0].id] = true;
        }
        setUserVotes(userVoteData);
      }
    } catch (error) {
      console.error('Failed to load proposals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadVoteData = async (proposalId: string) => {
    try {
      const response = await fetch(`/api/votes?proposal=${proposalId}`)
      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
      }
    } catch (error) {
      console.error('Failed to load vote data:', error)
    }
  }

  const castVote = async (proposalId: string, decision: boolean) => {


    setIsVoting(true)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${demoUser.email}`
        },
        body: JSON.stringify({
          proposal: proposalId,
          decision
        })
      })

      if (response.ok) {
        setUserVotes(prev => ({ ...prev, [proposalId]: decision }))
        await loadVoteData(proposalId)
        await loadProposals() // Refresh to update vote counts
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to cast vote')
      }
    } catch (error) {
      console.error('Failed to cast vote:', error)
      alert('Network error')
    } finally {
      setIsVoting(false)
    }
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()

    if (diff <= 0) return 'Voting closed'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  const canVote = (proposal: Proposal) => {
    return demoUser && proposal.status === 'active' && !userVotes[proposal.id] && !isDeadlinePassed(proposal.deadline)
  }



  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>Shareholder Voting</CardTitle>
          <CardDescription>Loading voting proposals...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-5 h-5" />
            <span>Shareholder Voting</span>
          </CardTitle>
          <CardDescription>
            As a shareholder, you have the power to influence important decisions. 
            Your shares give you voting rights on proposals that shape the future of the platform.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
          <TabsTrigger value="results">Voting Results</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {proposals.filter(p => p.status === 'active').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                <p className="text-slate-600">There are currently no active voting proposals.</p>
                <p className="text-sm text-slate-500 mt-2">
                  Check back later for new proposals that require shareholder input.
                </p>
              </CardContent>
            </Card>
          ) : (
            proposals
              .filter(proposal => proposal.status === 'active')
              .map((proposal) => (
                <Card key={proposal.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {proposal.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={isDeadlinePassed(proposal.deadline) ? 'destructive' : 'default'}>
                          {isDeadlinePassed(proposal.deadline) ? 'Closed' : 'Active'}
                        </Badge>
                        <div className="text-xs text-slate-500 text-right">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeRemaining(proposal.deadline)}
                          </div>
                          <div>{proposal.totalVotes} votes</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userVotes[proposal.id] !== undefined ? (
                      <Alert className="mb-4">
                        <CheckCircle className="w-4 h-4" />
                        <AlertDescription>
                          You voted <strong>{userVotes[proposal.id] ? 'Yes' : 'No'}</strong> on this proposal.
                          Thank you for participating!
                        </AlertDescription>
                      </Alert>
                    ) : canVote(proposal) ? (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                          Cast your vote on this proposal:
                        </p>
                        <div className="flex space-x-4">
                          <Button
                            onClick={() => castVote(proposal.id, true)}
                            disabled={isVoting}
                            className="flex-1"
                            variant="default"
                          >
                            {isVoting ? 'Voting...' : 'Vote Yes'}
                          </Button>
                          <Button
                            onClick={() => castVote(proposal.id, false)}
                            disabled={isVoting}
                            className="flex-1"
                            variant="outline"
                          >
                            {isVoting ? 'Voting...' : 'Vote No'}
                          </Button>
                        </div>
                      </div>
                    ) : isDeadlinePassed(proposal.deadline) ? (
                      <Alert>
                        <XCircle className="w-4 h-4" />
                        <AlertDescription>
                          Voting for this proposal has closed.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          You need to be a shareholder to vote on proposals.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>Created: {formatDateTime(proposal.createdAt)}</span>
                        <span>Deadline: {formatDateTime(proposal.deadline)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Proposal</CardTitle>
                <CardDescription>
                  Choose a proposal to view detailed voting results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {proposals.map((proposal) => (
                    <button
                      key={proposal.id}
                      onClick={() => setSelectedProposal(proposal)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProposal?.id === proposal.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-medium">{proposal.title}</div>
                      <div className="text-sm text-slate-600">
                        {proposal.totalVotes} votes • {proposal.status}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting Results</CardTitle>
                <CardDescription>
                  {selectedProposal 
                    ? selectedProposal.title 
                    : 'Select a proposal to view results'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {voteData && selectedProposal ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {voteData.yesVotes}
                        </div>
                        <div className="text-sm text-slate-600">Yes Votes</div>
                        <div className="text-xs text-green-600">
                          {voteData.yesPercentage}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {voteData.noVotes}
                        </div>
                        <div className="text-sm text-slate-600">No Votes</div>
                        <div className="text-xs text-red-600">
                          {voteData.noPercentage}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Yes</span>
                          <span>{voteData.yesPercentage}%</span>
                        </div>
                        <Progress value={voteData.yesPercentage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>No</span>
                          <span>{voteData.noPercentage}%</span>
                        </div>
                        <Progress value={voteData.noPercentage} className="h-2" />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Total Votes: {voteData.totalVotes}
                        </span>
                        <span>Participation: {((voteData.totalVotes / 1247) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Select a proposal to view voting results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Votes */}
          {voteData && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Votes</CardTitle>
                <CardDescription>
                  Latest votes cast on this proposal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {voteData.votes.slice(0, 10).map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          vote.decision ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">
                            {vote.user.name || vote.user.email}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDateTime(vote.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant={vote.decision ? 'default' : 'secondary'}>
                        {vote.decision ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  ))}
                  {voteData.votes.length > 10 && (
                    <div className="text-center text-sm text-slate-500 pt-2">
                      +{voteData.votes.length - 10} more votes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}