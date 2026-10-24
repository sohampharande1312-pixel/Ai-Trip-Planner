import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Wallet, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { DESTINATIONS, TRAVELERS, BUDGETS, AI_PROMPT } from '../constants/options'
import { generateTripPlan } from '../service/AIService'

function CreateTrip() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        destination: '',
        customDestination: '',
        days: 3,
        traveler: null,
        budget: null
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleDestinationChange = (e) => {
        setFormData({ ...formData, destination: e.target.value, customDestination: '' })
    }

    const handleCustomDestination = (e) => {
        setFormData({ ...formData, customDestination: e.target.value, destination: '' })
    }

    const handleDaysChange = (e) => {
        setFormData({ ...formData, days: parseInt(e.target.value) || 1 })
    }

    const selectTraveler = (id) => {
        setFormData({ ...formData, traveler: id })
    }

    const selectBudget = (id) => {
        setFormData({ ...formData, budget: id })
    }

    const isFormValid = () => {
        return (
            (formData.destination || formData.customDestination) &&
            formData.days > 0 &&
            formData.traveler &&
            formData.budget
        )
    }

    const handleGenerateTrip = async () => {
        // Check for API key in localStorage
        const storedKey = localStorage.getItem('openrouter_key')

        // Also check env var (for local dev) logic moved to service
        // if (!storedKey && !import.meta.env.VITE_OPENROUTER_API_KEY) {
        //   setError('Please click the key icon in the header and enter your OpenRouter API Key first.')
        //   return
        // }

        setLoading(true)
        setError(null)

        const destination = formData.customDestination || formData.destination
        const travelerInfo = TRAVELERS.find(t => t.id === formData.traveler)
        const budgetInfo = BUDGETS.find(b => b.id === formData.budget)

        const prompt = AI_PROMPT
            .replace('{destination}', destination)
            .replace('{days}', formData.days.toString())
            .replace('{days}', formData.days.toString())
            .replace('{traveler}', travelerInfo.people)
            .replace('{budget}', budgetInfo.title)
            .replace('{budget}', budgetInfo.title)

        try {
            // Pass the user's stored key to the service
            const tripPlan = await generateTripPlan(prompt, storedKey)

            // Store the trip plan in localStorage
            localStorage.setItem('currentTrip', JSON.stringify({
                ...tripPlan,
                userInput: {
                    destination,
                    days: formData.days,
                    traveler: travelerInfo,
                    budget: budgetInfo
                }
            }))

            navigate('/view-trip')
        } catch (err) {
            setError(err.message || 'Failed to generate trip. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 fade-in">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                        Tell us your travel <span className="gradient-text">preferences</span> 🏕️
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Just provide some basic information, and our AI will generate a customized itinerary based on your preferences.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-10">
                    {/* Destination */}
                    <div className="fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-white">What is your destination of choice?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Select a popular destination</label>
                                <select
                                    value={formData.destination}
                                    onChange={handleDestinationChange}
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white bg-transparent focus:border-orange-500 focus:outline-none transition-colors"
                                >
                                    <option value="" className="bg-dark-200">Choose destination...</option>
                                    {DESTINATIONS.map((dest, index) => (
                                        <option key={index} value={dest} className="bg-dark-200">{dest}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Or enter custom destination</label>
                                <input
                                    type="text"
                                    value={formData.customDestination}
                                    onChange={handleCustomDestination}
                                    placeholder="e.g., Coorg, Munnar, Rann of Kutch"
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-white">How many days are you planning?</h2>
                        </div>

                        <div className="glass rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Duration</span>
                                <span className="text-2xl font-bold text-orange-500">{formData.days} Days</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.days}
                                onChange={handleDaysChange}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-2">
                                <span>1 Day</span>
                                <span>10 Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Travelers */}
                    <div className="fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-white">Who are you traveling with?</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {TRAVELERS.map((traveler) => (
                                <div
                                    key={traveler.id}
                                    onClick={() => selectTraveler(traveler.id)}
                                    className={`selection-box glass rounded-xl p-5 border text-center ${formData.traveler === traveler.id
                                            ? 'selected border-orange-500'
                                            : 'border-white/10'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">{traveler.icon}</div>
                                    <h3 className="font-semibold text-white mb-1">{traveler.title}</h3>
                                    <p className="text-sm text-gray-400">{traveler.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-semibold text-white">What is your budget?</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {BUDGETS.map((budget) => (
                                <div
                                    key={budget.id}
                                    onClick={() => selectBudget(budget.id)}
                                    className={`selection-box glass rounded-xl p-5 border text-center ${formData.budget === budget.id
                                            ? 'selected border-orange-500'
                                            : 'border-white/10'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">{budget.icon}</div>
                                    <h3 className="font-semibold text-white mb-1">{budget.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{budget.desc}</p>
                                    <p className="text-xs text-orange-500">{budget.range}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleGenerateTrip}
                            disabled={!isFormValid() || loading}
                            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${isFormValid() && !loading
                                    ? 'btn-primary text-white'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>AI is crafting your perfect trip...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate My Trip</span>
                                </>
                            )}
                        </button>

                        {!isFormValid() && !loading && (
                            <p className="text-center text-gray-500 text-sm mt-3">
                                Please fill in all fields to continue
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateTrip
