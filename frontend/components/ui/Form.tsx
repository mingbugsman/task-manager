"use client"

import * as React from "react"
import { Controller, FormProvider } from "react-hook-form"

export const Form = FormProvider

export const FormField = Controller

export const FormItem = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-2">{children}</div>
}

export const FormLabel = ({ children }: any) => {
  return <label>{children}</label>
}

export const FormControl = ({ children }: any) => {
  return <div>{children}</div>
}

export const FormMessage = ({ children }: any) => {
  return <p className="text-red-500 text-sm">{children}</p>
}

export const FormDescription = ({ children }: any) => {
  return <p className="text-muted-foreground text-sm">{children}</p>
}