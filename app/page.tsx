'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {checkUser} from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
})

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      await checkUser(values.name, values.email)

      localStorage.setItem('userName', values.name)
      localStorage.setItem('userEmail', values.email)

      toast.success('User verified successfully')
      router.push('/library')
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error('Invalid user or error occurred : ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
          <Card className="rounded-2xl shadow-xl border border-zinc-700 bg-zinc-900 text-white">
            <CardContent className="p-6 space-y-6">
              <h1 className="text-2xl font-semibold text-center">Enter Details to Continue</h1>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-zinc-800 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} className="bg-zinc-800 text-white" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying...' : 'Continue'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  )
}
