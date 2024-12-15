import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

const LoginPage = () => {
    const [account, setAccount] = useState('')
    const [blackboardPassword, setBlackboardPassword] = useState('')
    const [edusoftPassword, setEdusoftPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const authContext = useAuth()
    if (!authContext) {
        throw new Error('AuthContext is null')
    }
    const { login } = authContext
    const navigate = useNavigate()
    const { toast } = useToast()
    const { theme, setTheme } = useTheme()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading) return
        setIsLoading(true)
        try {
            const response = await login(account, blackboardPassword, edusoftPassword)
            if (response.data.message == "Authentication successful") {
                setIsLoading(false)
                authContext.isAuthenticated = true;
                navigate('/utils', { replace: true })
            } else {
                throw new Error(response.data.message)
            }
        } catch (error) {
            setIsLoading(false)
            toast({
                title: "Login Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex self-center items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px] mx-auto">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Login</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'dark' ? <SunIcon className="h-[1.2rem] w-[1.2rem]" /> : <MoonIcon className="h-[1.2rem] w-[1.2rem]" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </div>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="account">Account</Label>
                            <Input
                                id="account"
                                type="text"
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="blackboardPassword">Blackboard Password</Label>
                            <Input
                                id="blackboardPassword"
                                type="password"
                                value={blackboardPassword}
                                onChange={(e) => setBlackboardPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edusoftPassword">Edusoft Password</Label>
                            <Input
                                id="edusoftPassword"
                                type="password"
                                value={edusoftPassword}
                                onChange={(e) => setEdusoftPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage
