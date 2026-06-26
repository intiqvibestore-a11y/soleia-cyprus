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

export default function Privacy() {
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
          Πολιτική Απορρήτου
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
            Η Soleia Cyprus ("εμείς", "μας") δεσμεύεται να προστατεύει τα προσωπικά σας δεδομένα.
            Η παρούσα Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε και προστατεύουμε
            τις πληροφορίες σας όταν χρησιμοποιείτε την εφαρμογή και τον ιστότοπο Soleia Cyprus.
          </p>
          <p className="mt-2" style={{ color: '#78716C' }}>
            Επικοινωνία: intiqvibestore@gmail.com | Αλέξανδρου Υψυλάντη 44
          </p>
        </Section>

        <Section title="Ποια δεδομένα συλλέγουμε">
          <ul className="space-y-1.5">
            {[
              'Στοιχεία λογαριασμού (όνομα, επώνυμο, email, τηλέφωνο, ημερομηνία γέννησης, φύλο)',
              'Στοιχεία πληρωμής μέσω Stripe',
              'Δεδομένα κρατήσεων',
              'Τεχνικά δεδομένα (IP, συσκευή, browser)',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A882' }} />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Γιατί τα χρησιμοποιούμε">
          <ul className="space-y-1.5">
            {[
              'Διαχείριση λογαριασμού και κρατήσεων',
              'Επεξεργασία πληρωμών μέσω Stripe',
              'Αποστολή ειδοποιήσεων (SMS, WhatsApp, Email)',
              'Βελτίωση εφαρμογής',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A882' }} />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Με ποιους μοιραζόμαστε τα δεδομένα">
          <ul className="space-y-1.5 mb-3">
            {[
              'Καταστήματα (στοιχεία κράτησης)',
              'Stripe (πληρωμές)',
              'Supabase (αποθήκευση εντός ΕΕ)',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C9A882' }} />
                {item}
              </li>
            ))}
          </ul>
          <p className="font-medium" style={{ color: '#3D2B1F' }}>Δεν πουλάμε δεδομένα σε τρίτους.</p>
        </Section>

        <Section title="Τα δικαιώματά σας (GDPR)">
          <p>
            Έχετε δικαίωμα Πρόσβασης, Διόρθωσης, Διαγραφής, Εναντίωσης και Φορητότητας των δεδομένων σας.
          </p>
          <p className="mt-2" style={{ color: '#78716C' }}>
            Επικοινωνία: intiqvibestore@gmail.com
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Χρησιμοποιούμε cookies για λειτουργία και ασφάλεια. Δεν χρησιμοποιούμε cookies διαφήμισης.
          </p>
        </Section>

        <Section title="Ασφάλεια">
          <p>Κρυπτογράφηση SSL, servers Supabase εντός ΕΕ.</p>
        </Section>

        <Section title="Επικοινωνία">
          <p>intiqvibestore@gmail.com</p>
        </Section>

      </div>
    </div>
  )
}
