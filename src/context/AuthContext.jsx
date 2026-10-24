import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Helper to load users from localStorage
const loadUsersDB = () => {
    try {
        const stored = localStorage.getItem('usersDB')
        if (stored) {
            return new Map(JSON.parse(stored))
        }
    } catch (e) {
        console.error('Failed to load users from localStorage:', e)
    }
    return new Map()
}

// Helper to save users to localStorage
const saveUsersDB = (usersMap) => {
    try {
        localStorage.setItem('usersDB', JSON.stringify([...usersMap]))
    } catch (e) {
        console.error('Failed to save users to localStorage:', e)
    }
}

// Persisted users database (survives page reloads)
const usersDB = loadUsersDB()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in from sessionStorage
        const storedUser = sessionStorage.getItem('currentUser')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const signup = async (name, email, password) => {
        // Check if user already exists
        if (usersDB.has(email)) {
            throw new Error('User already exists with this email')
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password // In real app, this would be hashed
        }

        usersDB.set(email, newUser)
        saveUsersDB(usersDB) // Persist to localStorage

        // Auto login after signup
        const userData = { id: newUser.id, name: newUser.name, email: newUser.email }
        setUser(userData)
        sessionStorage.setItem('currentUser', JSON.stringify(userData))

        return userData
    }

    const login = async (email, password) => {
        const storedUser = usersDB.get(email)

        if (!storedUser) {
            throw new Error('No account found with this email')
        }

        if (storedUser.password !== password) {
            throw new Error('Incorrect password')
        }

        const userData = { id: storedUser.id, name: storedUser.name, email: storedUser.email }
        setUser(userData)
        sessionStorage.setItem('currentUser', JSON.stringify(userData))

        return userData
    }

    const logout = () => {
        setUser(null)
        sessionStorage.removeItem('currentUser')
    }

    const value = {
        user,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
