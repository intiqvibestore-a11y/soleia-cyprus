import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function RescheduleBooking() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5F0EB]">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer"
          style={{ background: 'none', border: 'none' }}
          aria-label="Πίσω"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1C1917' }} strokeWidth={2} />
        </button>
        <h1 className="text-[18px] font-bold" style={{ color: '#3D2B1F' }}>
          Επιλέξτε νέα ημερομηνία και ώρα
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: '28vh' }}>
        <p className="text-[18px] font-semibold" style={{ color: '#3D2B1F' }}>Σύντομα διαθέσιμο</p>
        <p className="text-[14px] mt-2" style={{ color: '#A8A29E' }}>
          Η επαναπρογραμματισμός ραντεβού θα είναι διαθέσιμος σύντομα.
        </p>
      </div>
    </div>
  )
}
