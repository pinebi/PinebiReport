'use client'

import React from 'react'
import { FormBuilder, FormField } from '@/components/products/FormBuilder'

export default function FormBuilderPage() {
  const handleSave = (fields: FormField[], formName: string) => {
    console.log('Saving form:', { formName, fields })
    // Here you would typically save to database
    alert(`Form "${formName}" kaydedildi! ${fields.length} alan eklendi.`)
  }

  const handlePreview = (fields: FormField[]) => {
    console.log('Previewing form:', fields)
    // Here you would show a preview modal or navigate to preview page
    alert(`Önizleme: ${fields.length} alan ile form`)
  }

  return (
    <div className="h-screen">
      <FormBuilder
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  )
}




