import { Link } from 'react-router-dom'
import { Plane, Menu, X, LogOut, User, Key, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()
    const [apiKey, setApiKey] = useState('')
    const [showKeyInput, setShowKeyInput] = useState(false)

    // Load key from localStorage on mount
    useEffect(() => {
        const storedKey = localStorage.getItem('openrouter_key')
        if (storedKey) setApiKey(storedKey)
    }, [])

    const saveKey = () => {
        if (!apiKey.trim().startsWith('sk-or-')) {
            alert("Invalid OpenRouter Key. It must start with 'sk-or-'.")
            return
        }
        localStorage.setItem('openrouter_key', apiKey.trim())
        setShowKeyInput(false)
        alert('API Key saved successfully!')
        // No reload needed — AIService reads the key fresh from localStorage on each call
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plane className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:block">
                            India<span className="text-orange-500">Trip</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/create-trip"
                            className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
                        >
                            Plan Trip
                        </Link>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* API Key Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowKeyInput(!showKeyInput)}
                                className={`p-2 rounded-full transition-colors ${apiKey ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-300 hover:text-orange-500'}`}
                                title="Set OpenRouter API Key"
                            >
                                <Key className="w-5 h-5" />
                            </button>

                            {/* API Key Dropdown */}
                            {showKeyInput && (
                                <div className="absolute top-12 right-0 w-80 glass p-5 rounded-xl border border-white/10 shadow-xl z-50">
                                    <h3 className="text-white text-sm font-semibold mb-2">OpenRouter API Key</h3>
                                    <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                                        Required for the AI features. Free keys available.
                                    </p>
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="sk-or-..."
                                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm mb-3 focus:outline-none focus:border-orange-500 font-mono"
                                    />
                                    <button
                                        onClick={saveKey}
                                        className="w-full btn-primary py-2 rounded-lg text-white text-xs font-semibold mb-3"
                                    >
                                        Save & Reload
                                    </button>
                                    <a
                                        href="https://openrouter.ai/keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-1 text-[11px] text-orange-500 hover:text-orange-400"
                                    >
                                        <span>Get Free Key</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                                    <User className="w-4 h-4 text-orange-500" />
                                    <span className="text-white text-sm">{user?.name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2.5 rounded-full text-gray-300 hover:text-white transition-colors font-medium text-sm"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn-primary px-6 py-2.5 rounded-full text-white font-semibold text-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        <nav className="flex flex-col gap-4">
                            <div className="px-2">
                                <p className="text-xs text-gray-400 mb-2">OpenRouter API Key</p>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm mb-2 focus:outline-none focus:border-orange-500 font-mono"
                                />
                                <button
                                    onClick={() => { saveKey(); setMobileMenuOpen(false); }}
                                    className="w-full py-2 bg-white/5 rounded-lg text-white text-xs font-semibold hover:bg-white/10"
                                >
                                    Save & Reload
                                </button>
                                <a
                                    href="https://openrouter.ai/keys"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block text-center mt-2 text-[10px] text-orange-500"
                                >
                                    Get Free Key
                                </a>
                            </div>

                            <div className="h-px bg-white/10 my-1"></div>

                            <Link
                                to="/"
                                className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                to="/create-trip"
                                className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Plan Trip
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 text-white">
                                        <User className="w-4 h-4 text-orange-500" />
                                        <span>{user?.name}</span>
                                    </div>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="text-gray-300 hover:text-white text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="btn-primary px-6 py-2.5 rounded-full text-white font-semibold text-sm text-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header
