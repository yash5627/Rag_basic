"use client"
import { SessionProvider } from 'next-auth/react'
import React, { use } from 'react'

const SessionWrapper = ({children}) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}

export default SessionWrapper