"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Package, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  
  // Local loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  
  // Registration form fields
  const [regData, setRegData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  })
  
  const { login, register, error, clearError, isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated (after auth state is initialized to avoid flash)
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isInitialized, router])

  // Clear error and reset loading states when switching modes
  useEffect(() => {
    clearError()
    setIsLoginLoading(false)
    setIsRegisterLoading(false)
  }, [isRegisterMode, clearError])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (isLoginLoading) return // Prevent multiple submissions
    
    try {
      setIsLoginLoading(true)
      await login({ username: email, password })
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (isRegisterLoading) return // Prevent multiple submissions
    
    if (regData.password !== regData.confirmPassword) {
      return
    }
    
    try {
      setIsRegisterLoading(true)
      await register({
        username: regData.username,
        email: regData.email,
        password: regData.password,
        first_name: regData.firstName,
        last_name: regData.lastName
      })
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsRegisterLoading(false)
    }
  }

  // Don't show login form until auth is initialized (avoids flash when refresh token restores session)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Company Info */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">XYZ Knit Industries Limited</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Fabric Inventory Management System</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-2">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {isRegisterMode ? "Create Account" : "Login"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs value={isRegisterMode ? "register" : "login"} onValueChange={(value) => setIsRegisterMode(value === "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email or Username</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="admin@sinhaknit.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="h-12 pr-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out" 
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <div className="flex items-center gap-2 transition-opacity duration-200">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span className="transition-opacity duration-200">Sign In</span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={regData.firstName}
                        onChange={e => setRegData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={regData.lastName}
                        onChange={e => setRegData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={regData.username}
                      onChange={e => setRegData(prev => ({ ...prev, username: e.target.value }))}
                      className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={regData.email}
                      onChange={e => setRegData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="regPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={regData.password}
                        onChange={e => setRegData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-12 pr-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={regData.confirmPassword}
                      onChange={e => setRegData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                      required
                    />
                    {regData.password && regData.confirmPassword && regData.password !== regData.confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out" 
                    disabled={isRegisterLoading || regData.password !== regData.confirmPassword}
                  >
                    {isRegisterLoading ? (
                      <div className="flex items-center gap-2 transition-opacity duration-200">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 transition-opacity duration-200">
                        <UserPlus className="h-4 w-4" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {!isRegisterMode && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Demo credentials:</p>
                <p className="font-mono text-xs">superadmin@fabriventory.com / SuperAdmin@123</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
