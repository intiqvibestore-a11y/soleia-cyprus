import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const DEMO_BUSINESSES = {
  'wow-mymall': 'Wow Beauty Lab MYMALL',
}

export default function BusinessProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const name = DEMO_BUSINESSES[id] || 'Χώρος'

  return (
    <div className="min-h-screen bg-[#F5F0EB] pt-[62px]">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[20px] font-bold" style={{ color: '#3D2B1F' }}>{name}</h1>
      </div>

      <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: '28vh' }}>
        <p className="text-[18px] font-semibold" style={{ color: '#3D2B1F' }}>Σύντομα διαθέσιμο</p>
        <p className="text-[14px] mt-2" style={{ color: '#A8A29E' }}>
          Οι πληροφορίες για τον χώρο θα εμφανίζονται εδώ σύντομα.
        </p>
      </div>
    </div>
  )
}
