'use client'

import { useState } from 'react'
import { HelpCircle, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface FaqTabProps {
  content: Record<string, unknown>
  readOnly?: boolean
  onChange?: (content: Record<string, unknown>) => void
}

interface FaqItem {
  id: string
  question: string
  answer: string
}

export function FaqTab({ content, readOnly = false, onChange }: FaqTabProps) {
  const faqs = (content?.faqs as FaqItem[]) || []
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')

  const addFaq = () => {
    if (readOnly || !onChange) return
    const newFaq: FaqItem = {
      id: crypto.randomUUID(),
      question: 'New Question',
      answer: '',
    }
    onChange({ ...content, faqs: [...faqs, newFaq] })
    setEditingId(newFaq.id)
    setEditQuestion(newFaq.question)
    setEditAnswer(newFaq.answer)
  }

  const updateFaq = (id: string) => {
    if (readOnly || !onChange) return
    const newFaqs = faqs.map((faq) =>
      faq.id === id ? { ...faq, question: editQuestion, answer: editAnswer } : faq
    )
    onChange({ ...content, faqs: newFaqs })
    setEditingId(null)
  }

  const deleteFaq = (id: string) => {
    if (readOnly || !onChange) return
    onChange({ ...content, faqs: faqs.filter((faq) => faq.id !== id) })
  }

  const startEditing = (faq: FaqItem) => {
    setEditingId(faq.id)
    setEditQuestion(faq.question)
    setEditAnswer(faq.answer)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            FAQ
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'Frequently asked questions about this build'
              : 'Add common questions and answers about your build'}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={addFaq}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        )}
      </div>

      {faqs.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={faq.id} className="bg-card/50">
              {editingId === faq.id ? (
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Question</label>
                    <Input
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      placeholder="Enter the question"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Answer</label>
                    <Textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      placeholder="Enter the answer (supports markdown)"
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => updateFaq(faq.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <AccordionItem value={faq.id} className="border-0">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="pl-9">
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {faq.answer || 'No answer provided'}
                      </p>
                      {!readOnly && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(faq)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteFaq(faq.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Card>
          ))}
        </Accordion>
      ) : (
        <Card className="bg-card/50">
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {readOnly
                ? 'No FAQ entries for this build'
                : 'No FAQ entries yet. Add questions and answers to help others understand your build.'}
            </p>
            {!readOnly && (
              <Button onClick={addFaq} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tips for good FAQ */}
      {!readOnly && faqs.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Tips for a good FAQ:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Answer common questions about gear alternatives</li>
              <li>Explain skill rotation and priorities</li>
              <li>Include leveling tips and progression advice</li>
              <li>Address budget-friendly options</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
