import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ChevronRight, Plus, X } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, PaymentRequestButtonElement } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const TOP_UP_AMOUNTS = [10, 20, 50, 100]

const BRAND_DISPLAY = {
  visa:       'Visa',
  mastercard: 'Mastercard',
  amex:       'Amex',
  discover:   'Discover',
  diners:     'Diners',
  jcb:        'JCB',
  unionpay:   'UnionPay',
}

function formatBalance(balance) {
  const n = Number(balance || 0)
  const intPart = Math.floor(n).toLocaleString('el-GR')
  const decPart = String(Math.round((n % 1) * 100)).padStart(2, '0')
  return { intPart, decPart }
}

// Must be rendered inside <Elements> to use useStripe().
// Renders only if the browser supports Apple Pay / Google Pay.
function ApplePayButton({ onSuccess }) {
  const stripe = useStripe()
  const [pr, setPr] = useState(null)

  useEffect(() => {
    if (!stripe) return
    const paymentRequest = stripe.paymentRequest({
      country: 'CY',
      currency: 'eur',
      // €0.01 shown in the native sheet; we never confirm a PaymentIntent
      // so the card is saved without a real charge.
      total: { label: 'Soleia — Αποθήκευση κάρτας', amount: 1 },
      requestPayerName: true,
    })
    paymentRequest.canMakePayment().then(result => {
      if (result) setPr(paymentRequest)
    })
    paymentRequest.on('paymentmethod', async (ev) => {
      const { error } = await supabase.functions.invoke('stripe-customer', {
        body: { payment_method_id: ev.paymentMethod.id },
      })
      ev.complete(error ? 'fail' : 'success')
      if (!error) onSuccess()
    })
  }, [stripe]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!pr) return null

  return (
    <div className="mt-1">
      <PaymentRequestButtonElement
        options={{
          paymentRequest: pr,
          style: {
            paymentRequestButton: { type: 'default', theme: 'dark', height: '52px' },
          },
        }}
      />
    </div>
  )
}

export default function Wallet() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [profile,        setProfile]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount,   setCustomAmount]   = useState('')
  const [topping,        setTopping]        = useState(false)
  const [topupError,     setTopupError]     = useState('')
  const [showAddSheet,   setShowAddSheet]   = useState(false)
  const [removing,       setRemoving]       = useState(false)

  const refetchProfile = () => {
    if (!user) return
    supabase
      .from('profiles')
      .select('wallet_balance, stripe_payment_method_id, card_brand, card_last4')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/', { replace: true }); return }
    supabase
      .from('profiles')
      .select('wallet_balance, stripe_payment_method_id, card_brand, card_last4')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { setProfile(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading, navigate])

  const handleRemoveCard = async () => {
    if (!window.confirm('Θέλετε να αφαιρέσετε την αποθηκευμένη κάρτα;')) return
    setRemoving(true)
    await supabase
      .from('profiles')
      .update({ stripe_payment_method_id: null, card_brand: null, card_last4: null })
      .eq('id', user.id)
    setProfile(prev => ({ ...prev, stripe_payment_method_id: null, card_brand: null, card_last4: null }))
    setRemoving(false)
  }

  const handleTopUp = async () => {
    const amount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0)
    if (!amount || amount <= 0) return
    setTopping(true)
    setTopupError('')
    const { data, error } = await supabase.functions.invoke('stripe-topup', {
      body: { amount },
    })
    setTopping(false)
    if (error || data?.error) {
      setTopupError(data?.error || error?.message || 'Σφάλμα κατά τη φόρτωση')
      return
    }
    setProfile(prev => ({ ...prev, wallet_balance: data.new_balance }))
    setSelectedAmount(null)
    setCustomAmount('')
  }

  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5B0 50%, #F5ECD7 100%)' }}
      />
    )
  }

  const { intPart, decPart } = formatBalance(profile?.wallet_balance)
  const hasCard     = !!profile?.stripe_payment_method_id
  const cardBrand   = BRAND_DISPLAY[profile?.card_brand] || profile?.card_brand || 'Κάρτα'
  const cardLast4   = profile?.card_last4 || '••••'
  const topupAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0)

  return (
    // NOTE: No top-level <Elements> here — Stripe's iframe injection creates a CSS stacking
    // context that breaks position:fixed children and leaks styles into the bottom nav.
    // Elements is only mounted inside the sheet, scoped to ApplePayButton.
    <div className="min-h-screen flex flex-col">

      {/* ── Warm Mediterranean gradient header ── */}
      <div
        className="px-5 pb-12"
        style={{
          background: 'linear-gradient(135deg, #C9A96E 0%, #E8D5B0 50%, #F5ECD7 100%)',
          paddingTop: 'calc(62px + 20px)',
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center mb-8 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#3D2B1F' }} />
        </button>

        {/* Balance display */}
        <div className="flex items-end leading-none mb-2">
          <span className="font-bold leading-none" style={{ fontSize: 64, color: '#3D2B1F' }}>
            {intPart}
          </span>
          <span className="font-bold" style={{ fontSize: 32, marginBottom: 5, color: '#3D2B1F' }}>
            ,{decPart} €
          </span>
        </div>
        <p className="text-[14px] font-medium mb-6" style={{ color: 'rgba(61,43,31,0.60)' }}>
          Υπόλοιπο πορτοφολιού
        </p>

        {/* Gift card button */}
        <button
          className="flex items-center gap-2 px-5 py-[10px] rounded-full text-[14px] font-semibold cursor-pointer transition-colors hover:bg-black/5"
          style={{ border: '1.5px solid rgba(61,43,31,0.30)', background: 'transparent', color: '#3D2B1F' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Προσθέστε μια δωροκάρτα
        </button>
      </div>

      {/* ── White content card ── */}
      <div
        className="flex-1 bg-white px-5 pt-6 pb-10"
        style={{ borderRadius: '24px 24px 0 0', marginTop: -20 }}
      >
        <h2 className="text-[18px] font-bold text-[#1C1917] mb-4">Κάρτες</h2>

        {hasCard ? (
          <>
            {/* Saved card row */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: '#F8F5F2' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EEF2FF' }}
              >
                <CreditCard className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1C1917]">{cardBrand}</p>
                <p className="text-[13px] text-[#A8A29E]">•••• •••• •••• {cardLast4}</p>
              </div>
              {/* ✕ remove button */}
              <button
                onClick={handleRemoveCard}
                disabled={removing}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-red-50 disabled:opacity-40"
                style={{ background: 'none', border: 'none' }}
                aria-label="Αφαίρεση κάρτας"
              >
                <X className="w-[15px] h-[15px]" style={{ color: '#B8AEA6' }} strokeWidth={2} />
              </button>
            </div>

            {/* Add another card link */}
            <button
              onClick={() => setShowAddSheet(true)}
              className="flex items-center gap-2 px-1 py-3 mt-1 text-[14px] font-semibold cursor-pointer transition-opacity hover:opacity-60"
              style={{ background: 'none', border: 'none', color: '#C9A882' }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Προσθήκη κάρτας
            </button>
          </>
        ) : (
          /* No card — large add row */
          <button
            onClick={() => setShowAddSheet(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-[#FDFAF7]"
            style={{ background: '#F8F5F2', border: 'none' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#EEF2FF' }}
            >
              <CreditCard className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#1C1917] font-medium">
              Προσθήκη χρεωστικής/πιστωτικής κάρτας
            </span>
            <ChevronRight className="w-4 h-4 text-[#D1CAC1] shrink-0" strokeWidth={1.7} />
          </button>
        )}

        {/* ── Top-up section (only when a card is saved) ── */}
        {hasCard && (
          <>
            <h2 className="text-[18px] font-bold text-[#1C1917] mt-6 mb-4">Φόρτωση υπολοίπου</h2>

            {/* Preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {TOP_UP_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmount(amt); setCustomAmount('') }}
                  className="h-[52px] rounded-xl text-[15px] font-semibold transition-colors cursor-pointer"
                  style={{
                    background: selectedAmount === amt ? '#1C1917' : '#F8F5F2',
                    color:      selectedAmount === amt ? 'white'   : '#1C1917',
                    border:     selectedAmount === amt ? 'none'    : '1px solid #E8E0D8',
                  }}
                >
                  €{amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#1C1917] pointer-events-none">
                €
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
                placeholder="Άλλο ποσό"
                className="w-full h-[52px] pl-8 pr-4 border border-[#D1CAC1] rounded-xl text-[15px] text-[#1C1917] placeholder-[#B8AEA6] focus:outline-none focus:border-[#1C1917] transition-colors bg-white"
              />
            </div>

            {topupError && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {topupError}
              </p>
            )}

            {/* Top-up confirm — black */}
            <button
              onClick={handleTopUp}
              disabled={topping || !topupAmount || topupAmount <= 0}
              className="w-full h-[54px] rounded-full font-semibold text-[16px] transition-opacity disabled:opacity-40 cursor-pointer"
              style={{ background: '#1a1a1a', color: 'white', border: 'none' }}
            >
              {topping
                ? 'Επεξεργασία...'
                : topupAmount > 0
                  ? `Φόρτωση €${topupAmount}`
                  : 'Επιλέξτε ποσό'}
            </button>
          </>
        )}
      </div>

      {/* ── Add card bottom sheet ──
           z-[200] ensures it renders above the bottom nav bar (typically z-40–z-60).
           pb-28 (112px) gives enough clearance above the nav bar + safe area. -->
      */}
      {showAddSheet && (
        <div
          className="fixed inset-0 z-[200] flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddSheet(false) }}
        >
          <div
            className="bg-white px-5 pt-5 pb-28"
            style={{ borderRadius: '20px 20px 0 0' }}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-bold text-[#1C1917]">Προσθήκη κάρτας</h3>
              <button
                onClick={() => setShowAddSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-[#F5F0EB]"
                style={{ background: 'none', border: 'none' }}
              >
                <X className="w-4 h-4 text-[#78716C]" strokeWidth={2} />
              </button>
            </div>

            {/* Option 1: Credit / Debit card */}
            <button
              onClick={() => { setShowAddSheet(false); navigate('/wallet/add-card') }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-colors hover:bg-[#F0EBE3] mb-3"
              style={{ background: '#F8F5F2', border: 'none' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EEF2FF' }}
              >
                <CreditCard className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-[#1C1917]">Χρεωστική / Πιστωτική</p>
                <p className="text-[12px] text-[#A8A29E] mt-0.5">Visa, Mastercard, Amex</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D1CAC1]" strokeWidth={1.7} />
            </button>

            {/* Option 2: Apple Pay / Google Pay — only shown if browser supports it.
                 <Elements> is scoped here, not at the page level, to avoid Stripe's
                 iframe/CSS from leaking styles into the rest of the page. -->
            */}
            {stripePromise && (
              <Elements stripe={stripePromise}>
                <ApplePayButton
                  onSuccess={() => {
                    setShowAddSheet(false)
                    refetchProfile()
                  }}
                />
              </Elements>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
