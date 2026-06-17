import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase/client'

export default function Wallet() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/', { replace: true }); return }
    supabase.from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.wallet_balance != null) setBalance(Number(data.wallet_balance))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading, navigate])

  if (authLoading || loading) return <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }} />

  const intPart = Math.floor(balance).toLocaleString('el-GR')
  const decPart = String(Math.round((balance % 1) * 100)).padStart(2, '0')

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Gradient top section ── */}
      <div
        className="px-5 pb-12"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          paddingTop: 'calc(62px + 20px)',
        }}
      >
        {/* Back arrow */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center mb-8 cursor-pointer"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Balance */}
        <div className="flex items-end leading-none mb-2">
          <span className="font-bold text-white leading-none" style={{ fontSize: 64 }}>
            {intPart}
          </span>
          <span className="font-bold text-white" style={{ fontSize: 32, marginBottom: 5 }}>
            ,{decPart} €
          </span>
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
        <h2 className="text-[18px] font-bold text-[#1C1917] mb-4">Κάρτες</h2>

        {/* Add card row */}
        <button
          onClick={() => navigate('/wallet/add-card')}
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
      </div>

    </div>
  )
}
