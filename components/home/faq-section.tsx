import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is BizNest USA and how does the business directory work?",
    answer: "BizNest USA is a unified national directory connecting verified American businesses, licensed trade professionals, and hiring employers across all 50 states. Business owners can submit their listings for free, while consumers get direct access to verified phone numbers, websites, and service scopes."
  },
  {
    question: "How do I verify if a business or contractor is licensed?",
    answer: "You can request their state license number and cross-reference it with official state licensing board databases (such as the Secretary of State or Department of Professional Regulation). BizNest USA awards verified badges to businesses that submit verifiable credentials."
  },
  {
    question: "Why does BizNest USA provide direct phone numbers and websites?",
    answer: "Unlike closed lead-generation platforms that hide contact information behind paywalls, BizNest USA provides transparent, direct access so consumers and clients can connect immediately with local providers."
  },
  {
    question: "How does listing on BizNest USA improve local Google rankings?",
    answer: "Consistent Name, Address, and Phone (NAP) citations across trusted platforms like BizNest USA provide search engines with verifiable proof of your physical presence and service area, strengthening local search prominence."
  }
]

export default function FAQSection() {
  return (
    <section className="py-20 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600">Everything you need to know about the BizNest USA business and professional network.</p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-100">
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4 text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
