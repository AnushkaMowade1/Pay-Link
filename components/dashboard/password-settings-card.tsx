"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { usePassword } from "@/hooks/use-password"
import { useWallet } from "@/hooks/use-wallet"
import { PasswordSetupDialog } from "@/components/auth/password-setup-dialog"
import { PasswordVerifyDialog } from "@/components/auth/password-verify-dialog"

export function PasswordSettingsCard() {
  const { isConnected } = useWallet()
  const { isPasswordSet, isLoading: passwordLoading } = usePassword()
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [showPasswordVerify, setShowPasswordVerify] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleSetPassword = () => {
    setShowPasswordSetup(true)
  }

  const handleChangePassword = () => {
    setShowPasswordVerify(true)
  }

  const handlePasswordVerifiedForChange = () => {
    setShowPasswordVerify(false)
    setShowChangePassword(true)
  }

  const handlePasswordChanged = () => {
    setShowChangePassword(false)
    setIsChangingPassword(false)
  }

  if (!isConnected) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Password Security</CardTitle>
              <CardDescription>Secure your transactions with a password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Connect your wallet to manage password settings.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (passwordLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Password Security</CardTitle>
              <CardDescription>Loading password status...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Password Security</CardTitle>
              <CardDescription>Secure your transactions with a password</CardDescription>
            </div>
            {isPasswordSet && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Active</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPasswordSet ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Shield className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Your payment password is active. All transactions require password authorization.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Security Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Password required for all payment transactions</li>
                    <li>• Encrypted storage using Web3 security standards</li>
                    <li>• Wallet-specific password protection</li>
                    <li>• Cannot be recovered if lost</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleChangePassword}
                  variant="outline"
                  className="w-full"
                  disabled={isChangingPassword}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  No password set. Your transactions are not protected. Set a password to secure your payments.
                </AlertDescription>
              </Alert>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Why Set a Password?</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Prevents unauthorized transactions</li>
                  <li>• Adds extra security layer to your wallet</li>
                  <li>• Required for all payment operations</li>
                  <li>• Follows Web3 security best practices</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleSetPassword}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <Lock className="w-4 h-4 mr-2" />
                Set Payment Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Setup Dialog */}
      <PasswordSetupDialog 
        open={showPasswordSetup}
        onOpenChange={setShowPasswordSetup}
        onPasswordSet={() => {
          setShowPasswordSetup(false)
        }}
      />

      {/* Password Verification Dialog for Change */}
      <PasswordVerifyDialog
        open={showPasswordVerify}
        onOpenChange={setShowPasswordVerify}
        onVerified={handlePasswordVerifiedForChange}
        title="Verify Current Password"
        description="Enter your current password to change it"
      />

      {/* Change Password Dialog */}
      <PasswordSetupDialog 
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
        onPasswordSet={handlePasswordChanged}
      />
    </>
  )
}