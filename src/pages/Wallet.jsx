import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

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

export default function Wallet() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [topping, setTopping]           = useState(false)
  const [topupError, setTopupError]     = useState('')

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
    // Update balance in state immediately
    setProfile(prev => ({ ...prev, wallet_balance: data.new_balance }))
    setSelectedAmount(null)
    setCustomAmount('')
  }

  if (authLoading || loading) {
    return <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }} />
  }

  const { intPart, decPart } = formatBalance(profile?.wallet_balance)
  const hasCard  = !!profile?.stripe_payment_method_id
  const cardBrand = BRAND_DISPLAY[profile?.card_brand] || profile?.card_brand || 'Κάρτα'
  const cardLast4 = profile?.card_last4 || '••••'
  const topupAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0)

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Gradient header ── */}
      <div
        className="px-5 pb-12"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          paddingTop: 'calc(62px + 20px)',
        }}
      >
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center mb-8 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Balance */}
        <div className="flex items-end leading-none mb-2">
          <span className="font-bold text-white leading-none" style={{ fontSize: 64 }}>{intPart}</span>
          <span className="font-bold text-white" style={{ fontSize: 32, marginBottom: 5 }}>,{decPart} €</span>
        </div>
        <p className="text-white/75 text-[14px] font-medium mb-6">Υπόλοιπο πορτοφολιού</p>

        {/* Gift card button */}
        <button
          className="flex items-center gap-2 px-5 py-[10px] rounded-full text-white text-[14px] font-semibold transition-colors hover:bg-white/10 cursor-pointer"
          style={{ border: '1.5px solid rgba(255,255,255,0.55)', background: 'transparent' }}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Προσθέστε μια δωροκάρτα
        </button>
      </div>

      {/* ── White card section ── */}
      <div
        className="flex-1 bg-white px-5 pt-6 pb-10"
        style={{ borderRadius: '24px 24px 0 0', marginTop: -20 }}
      >
        {/* ── Saved card ── */}
        <h2 className="text-[18px] font-bold text-[#1C1917] mb-4">Κάρτες</h2>

        {hasCard ? (
          <>
            {/* Card row */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-6"
              style={{ background: '#F8F5F2' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
                <CreditCard className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1C1917]">{cardBrand}</p>
                <p className="text-[13px] text-[#A8A29E]">•••• •••• •••• {cardLast4}</p>
              </div>
              <button
                onClick={() => navigate('/wallet/add-card')}
                className="text-[12px] font-semibold cursor-pointer shrink-0"
                style={{ color: '#C9A882', background: 'none', border: 'none' }}
              >
                Αλλαγή
              </button>
            </div>

            {/* ── Top-up section ── */}
            <h2 className="text-[18px] font-bold text-[#1C1917] mb-4">Φόρτωση υπολοίπου</h2>

            {/* Preset amount buttons */}
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

            {/* Custom amount input */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#1C1917] pointer-events-none">€</span>
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

            {/* Confirm top-up button */}
            <button
              onClick={handleTopUp}
              disabled={topping || !topupAmount || topupAmount <= 0}
              className="w-full h-[54px] rounded-full text-white font-semibold text-[16px] transition-opacity disabled:opacity-40 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', border: 'none' }}
            >
              {topping
                ? 'Επεξεργασία...'
                : topupAmount > 0
                  ? `Φόρτωση €${topupAmount}`
                  : 'Επιλέξτε ποσό'}
            </button>
          </>
        ) : (
          /* No card saved yet — show add-card row */
          <button
            onClick={() => navigate('/wallet/add-card')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-colors hover:bg-[#FDFAF7]"
            style={{ background: '#F8F5F2', border: 'none' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EEF2FF' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#818CF8' }} strokeWidth={1.7} />
            </div>
            <span className="flex-1 text-left text-[15px] text-[#1C1917] font-medium">
              Προσθήκη χρεωστικής/πιστωτικής κάρτας
            </span>
            <ChevronRight className="w-4 h-4 text-[#D1CAC1] shrink-0" strokeWidth={1.7} />
          </button>
        )}
      </div>
    </div>
  )
}
