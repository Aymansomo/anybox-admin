"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FooterContact {
  id: number
  icon_type: string
  title: string
  subtitle: string
  is_active: boolean
  sort_order: number
}

export default function ContactInfoSection() {
  const [contactItems, setContactItems] = useState<FooterContact[]>([])
  const [loading, setLoading] = useState(true)

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'mail':
        return Mail
      case 'phone':
        return Phone
      case 'map_pin':
        return MapPin
      default:
        return MapPin
    }
  }

  useEffect(() => {
    fetchFooterContact()
  }, [])

  const fetchFooterContact = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_contact')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching footer contact:', error)
        return
      }

      setContactItems(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-white py-12 border-t border-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2 animate-pulse">
                <div className="shrink-0 border border-gray-300 rounded-full p-2 bg-gray-200 h-10 w-10"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-12 border-t border-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {contactItems.map((item) => {
            const IconComponent = getIcon(item.icon_type)
            return (
              <div key={item.id} className="flex flex-col items-center text-center space-y-2">
                <div className="shrink-0 border border-gray-300 rounded-full p-2">
                  <IconComponent className="h-6 w-6 text-secondary" />
                </div>
                <span className="text-gray-800 font-bold text-lg">{item.title}</span>
                <span className="text-gray-600 text-sm">{item.subtitle}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
