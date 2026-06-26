import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-[15px] font-bold uppercase tracking-wide mb-3" style={{ color: '#C9A882' }}>
        {title}
      </h2>
      <div className="text-[14px] leading-relaxed" style={{ color: '#3D2B1F' }}>
        {children}
      </div>
    </div>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A882' }} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px] pb-16">

      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer mb-3"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>
          Όροι Χρήσης
        </h1>
        <p className="text-[13px] mt-1.5" style={{ color: '#A8A29E' }}>
          Τελευταία ενημέρωση: Ιούνιος 2026
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 mb-6 h-px" style={{ background: '#E8E0D8' }} />

      {/* Content */}
      <div className="px-5">

        <Section title="Εισαγωγή">
          <p>
            Οι παρόντες Όροι Χρήσης διέπουν τη χρήση της εφαρμογής και του ιστοτόπου Soleia Cyprus.
            Χρησιμοποιώντας την εφαρμογή αποδέχεστε τους παρόντες όρους.
          </p>
        </Section>

        <Section title="Χρήση εφαρμογής">
          <BulletList items={[
            'Άνω των 18 ετών',
            'Ευθύνη ασφάλειας λογαριασμού',
            'Απαγόρευση παράνομης χρήσης',
          ]} />
        </Section>

        <Section title="Κρατήσεις">
          <p>
            Η Soleia Cyprus λειτουργεί ως διαμεσολαβητής. Η ευθύνη παροχής της υπηρεσίας ανήκει
            στο κατάστημα.
          </p>
        </Section>

        <Section title="Πληρωμές">
          <BulletList items={[
            'Μέσω Stripe',
            'Πορτοφόλι Soleia',
            'Δεν αποθηκεύουμε στοιχεία καρτών',
          ]} />
        </Section>

        <Section title="Ακυρώσεις">
          <p>
            Η πολιτική ακύρωσης ορίζεται από κάθε κατάστημα. Η Soleia Cyprus δεν φέρει ευθύνη
            για χρεώσεις ακύρωσης.
          </p>
        </Section>

        <Section title="Περιορισμός ευθύνης">
          <p>Η πλατφόρμα παρέχεται "ως έχει".</p>
        </Section>

        <Section title="Τροποποιήσεις">
          <p>
            Διατηρούμε δικαίωμα τροποποίησης. Αλλαγές ανακοινώνονται μέσω εφαρμογής.
          </p>
        </Section>

        <Section title="Επικοινωνία">
          <p>intiqvibestore@gmail.com | Αλέξανδρου Υψυλάντη 44</p>
        </Section>

      </div>
    </div>
  )
}
