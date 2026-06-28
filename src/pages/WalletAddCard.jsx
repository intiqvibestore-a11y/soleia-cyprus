import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#1C1917',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': { color: '#B8AEA6' },
    },
    invalid: { color: '#EF4444' },
  },
}

function CardBrands() {
  const brands = [
    { name: 'VISA',     bg: '#EEF2FF', color: '#1A1F71' },
    { name: 'MC',       bg: '#FFF1F2', color: '#BE123C' },
    { name: 'AMEX',     bg: '#EFF6FF', color: '#1D4ED8' },
    { name: 'DINERS',   bg: '#F5F5F5', color: '#374151' },
    { name: 'DISCOVER', bg: '#FFF7ED', color: '#C2410C' },
  ]
  return (
    <div className="flex items-center gap-1.5">
      {brands.map(({ name, bg, color }) => (
        <div
          key={name}
          className="h-[22px] px-1.5 rounded flex items-center justify-center font-bold"
          style={{ background: bg, color, fontSize: 9, minWidth: 30, border: '1px solid rgba(0,0,0,0.08)' }}
        >
          {name}
        </div>
      ))}
    </div>
  )
}

function AddCardForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [cardName, setCardName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inputCls = 'w-full h-[52px] px-4 border border-[#D1CAC1] rounded-xl text-[15px] text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors bg-white'
  const labelCls = 'block text-[13px] font-semibold text-[#1C1917] mb-1.5'
  const stripeCls = 'px-4 py-[15px] border border-[#D1CAC1] rounded-xl bg-white focus-within:border-[#1C1917] transition-colors'

  const handleSave = async () => {
    if (!stripe || !elements || !user) return
    setSaving(true)
    setError('')

    // Step 1: tokenise the card with Stripe.js
    const cardEl = elements.getElement(CardNumberElement)
    const { paymentMethod, error: stripeErr } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardEl,
      billing_details: { name: cardName },
    })
    if (stripeErr) { setError(stripeErr.message); setSaving(false); return }

    // Step 2: attach PM to Stripe customer via Edge Function (needs server-side secret key)
    const { data, error: fnErr } = await supabase.functions.invoke('stripe-customer', {
      body: { payment_method_id: paymentMethod.id },
    })
    if (fnErr || !data || data?.error) {
      setError(data?.error || fnErr?.message || 'Σφάλμα αποθήκευσης κάρτας')
      setSaving(false)
      return
    }

    // Step 3: persist card details to profile directly from client.
    // Belt-and-suspenders: the edge function also does this, but if its DB write
    // fails for any reason (e.g. missing columns before migration), this ensures
    // stripe_payment_method_id, card_brand and card_last4 are always updated.
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        stripe_payment_method_id: paymentMethod.id,
        card_brand: paymentMethod.card?.brand ?? '',
        card_last4: paymentMethod.card?.last4 ?? '',
      })
      .eq('id', user.id)

    setSaving(false)
    if (profileErr) {
      setError('Σφάλμα αποθήκευσης στοιχείων κάρτας. Δοκιμάστε ξανά.')
      return
    }
    navigate('/wallet')
  }

  return (
    <div className="px-5 flex flex-col gap-4">

      {/* Name on card */}
      <div>
        <label className={labelCls}>Όνομα στην κάρτα *</label>
        <input
          className={inputCls}
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          placeholder="Προσθήκη του ονοματεπώνυμου του κατόχου της..."
        />
      </div>

      {/* Card number */}
      <div>
        <label className={labelCls}>Αριθμός κάρτας *</label>
        <div className={stripeCls}>
          <CardNumberElement options={ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Expiry + CVC side by side */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelCls}>Ημερομηνία λήξης *</label>
          <div className={stripeCls}>
            <CardExpiryElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
        <div className="flex-1">
          <label className={labelCls}>Κωδικός ασφαλείας *</label>
          <div className={stripeCls}>
            <CardCvcElement options={ELEMENT_OPTIONS} />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !stripe}
        className="w-full h-[54px] rounded-full text-white font-semibold text-[16px] transition-opacity disabled:opacity-60 mt-2 cursor-pointer"
        style={{ background: '#1C1917', border: 'none' }}
      >
        {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
      </button>

      {/* Security footer */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-4">
        <span className="text-[12px] text-[#A8A29E]">Πληρωμή με ασφάλεια με</span>
        <CardBrands />
      </div>

    </div>
  )
}

export default function WalletAddCard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  if (authLoading || !user) return <div className="min-h-screen bg-[#F5F0EB]" />

  return (
    <div className="min-h-screen bg-[#F5F0EB] pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-5">
        <button
          onClick={() => navigate('/wallet')}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <ArrowLeft className="w-5 h-5 text-[#1C1917] cursor-pointer" />
        </button>
        <h1 className="text-[17px] font-bold text-[#1C1917]">Προσθήκη κάρτας</h1>
      </div>

      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <AddCardForm />
        </Elements>
      ) : (
        <div className="mx-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-[13px] text-amber-700 font-medium">
            Προσθέστε <code className="font-mono bg-amber-100 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> στο αρχείο <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> για να ενεργοποιήσετε τις πληρωμές.
          </p>
        </div>
      )}
    </div>
  )
}
