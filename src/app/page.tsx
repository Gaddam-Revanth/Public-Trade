'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { TradingInterface } from '@/components/trading/trading-interface'
import { VotingSystem } from '@/components/voting/voting-system'
import { AuthModal } from '@/components/auth/auth-modal'

import { ArrowUp, ArrowDown, TrendingUp, Users, BarChart3, Vote, LogOut } from 'lucide-react'

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState(1000.00)
  const [priceChange, setPriceChange] = useState(15.50)
  const [isPositive, setIsPositive] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showTrading, setShowTrading] = useState(false)
  const [tradingDefaultTab, setTradingDefaultTab] = useState<'trade' | 'charts' | 'history' | 'portfolio'>('trade')
  
  // Debug state changes
  useEffect(() => {
    console.log('tradingDefaultTab changed to:', tradingDefaultTab)
  }, [tradingDefaultTab])
  const [showVoting, setShowVoting] = useState(false)
  const [demoUser, setDemoUser] = useState<{ name: string; email: string; balance: number } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleLogin = () => {
    // Simulate successful login with demo credentials
    setIsLoggedIn(true);
    setDemoUser({ name: 'Demo User', email: 'demo@example.com', balance: 10000.00 });
  };

  const handleLogout = () => {
    // Simulate logout
    setIsLoggedIn(false);
    setDemoUser(null);
  };

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10
      setCurrentPrice(prev => Math.max(prev + change, 100))
      setPriceChange(change)
      setIsPositive(change >= 0)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };
  
  const handleSignupClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };
  
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    handleLogin();
  };

  if (showTrading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-slate-800">
                  PublicTrade
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  BETA
                </Badge>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-6">
                  <button 
                    onClick={() => setShowTrading(false)}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { setShowTrading(false); setShowVoting(true) }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Vote
                  </button>
                  <button 
                    onClick={() => { 
                      console.log('Portfolio button clicked in trading section');
                      setTradingDefaultTab('portfolio');
                      setTimeout(() => {
                        setShowTrading(true);
                      }, 0);
                    }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Portfolio
                  </button>
                </div>
                
                {/* Stock Price Ticker */}
                <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-lg font-semibold">₹{currentPrice.toFixed(2)}</span>
                  <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isLoggedIn ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600">
                        Welcome, {demoUser?.name || demoUser?.email}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        ₹{demoUser?.balance?.toFixed(2) || '0.00'}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleLoginClick}>
                        Log In
                      </Button>
                      <Button size="sm" onClick={handleSignupClick}>
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Trading Interface */}
        <div className="container mx-auto px-4 py-8">
          <TradingInterface defaultTab={tradingDefaultTab} />
        </div>


      </div>
    )
  }

  if (showVoting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold text-slate-800">
                PublicTrade
              </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  BETA
                </Badge>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-6">
                  <button 
                    onClick={() => setShowVoting(false)}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { setShowVoting(false); setShowTrading(true) }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Trade
                  </button>
                  <button 
                    onClick={() => { 
                      console.log('Portfolio button clicked in voting section');
                      setShowVoting(false);
                      setTradingDefaultTab('portfolio');
                      setTimeout(() => {
                        setShowTrading(true);
                      }, 0);
                    }}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Portfolio
                  </button>
                </div>
                
                {/* Stock Price Ticker */}
                <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-lg font-semibold">₹{currentPrice.toFixed(2)}</span>
                  <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isLoggedIn ? (
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600">
                        Welcome, {demoUser?.name || demoUser?.email}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        ₹{demoUser?.balance?.toFixed(2) || '0.00'}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-1" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleLoginClick}>
                        Log In
                      </Button>
                      <Button size="sm" onClick={handleSignupClick}>
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Voting Interface */}
        <div className="container mx-auto px-4 py-8">
          <VotingSystem />
        </div>

       
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        authMode={authMode}
        onSuccess={handleAuthSuccess}
      />
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-slate-800">
                PublicTrade
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                BETA
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => isLoggedIn && setShowTrading(true)}
                    className={`transition-colors ${isLoggedIn ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 cursor-not-allowed'}`}
                    title={isLoggedIn ? 'Go to trading' : 'Login to trade'}
                >
                  Trade
                </button>
                <button 
                  onClick={() => isLoggedIn && setShowVoting(true)}
                    className={`transition-colors ${isLoggedIn ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 cursor-not-allowed'}`}
                    title={isLoggedIn ? 'Go to voting' : 'Login to vote'}
                >
                  Vote
                </button>
                <button 
                  onClick={() => { 
                    console.log('Main nav Portfolio button clicked, isLoggedIn:', isLoggedIn);
                    if (isLoggedIn) { 
                      console.log('Setting tradingDefaultTab to portfolio');
                      setTradingDefaultTab('portfolio');
                      console.log('Setting showTrading to true');
                      setTimeout(() => {
                        setShowTrading(true);
                      }, 0);
                    } else {
                      setShowAuthModal(true);
                    }
                  }}
                  className={`transition-colors ${isLoggedIn ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 cursor-not-allowed'}`}
                  title={isLoggedIn ? 'Go to portfolio' : 'Login to view portfolio'}
                  disabled={!isLoggedIn}
                >
                  Portfolio
                </button>
              </div>
              
              {/* Stock Price Ticker */}
              <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-lg font-semibold">₹{currentPrice.toFixed(2)}</span>
                <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-600">
                      Welcome, {demoUser?.name || demoUser?.email}
                      </span>
                      <span className="text-sm font-medium text-slate-800">
                        ₹{demoUser?.balance?.toFixed(2) || '0.00'}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleLoginClick}>
                      Log In
                    </Button>
                    <Button size="sm" onClick={handleSignupClick}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
            🇮🇳 India's First
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Publicly Traded Person
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
            Invest in human potential. Buy and sell shares in India's first publicly traded individual. 
            Be part of a revolutionary financial experiment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Button size="lg" className="text-lg px-8 py-6" onClick={() => setShowTrading(true)}>
                  Start Trading
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => setShowVoting(true)}>
                  Vote Now
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6" onClick={handleSignupClick}>
                  Start Trading
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</div>
              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}% from yesterday
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shareholders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2.4M</div>
              <p className="text-xs text-muted-foreground">+8% from yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹10M</div>
              <p className="text-xs text-muted-foreground">10,000 shares outstanding</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A revolutionary platform where you can invest directly in human potential and growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sign up and get ₹10,000 virtual currency to start trading. No real money required.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Trade Shares</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buy and sell shares based on performance, potential, and market sentiment.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Vote className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Vote & Influence</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                As a shareholder, vote on important decisions and shape the future.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Be Part of the Future?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already trading in this revolutionary market. 
            Your investment in human potential starts here.
          </p>
          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={() => setShowTrading(true)}>
                Go to Trading
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => setShowVoting(true)}>
                Vote Now
              </Button>
            </div>
          ) : (
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={handleSignupClick}>
              Open Your Account Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-600 mb-4 md:mb-0">
              © 2024 PublicTrade. The First Publicly Traded Person Platform.
            </div>
            <div className="flex space-x-6 text-slate-600">
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">FAQ</a>
              <a href="#" className="hover:text-slate-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>



    </div>
  )
}