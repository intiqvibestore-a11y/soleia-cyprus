import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'

function Flag({ iso }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      width="22"
      height="16"
      alt=""
      className="rounded-[3px] object-cover shrink-0"
      style={{ display: 'block' }}
    />
  )
}

export const COUNTRIES = [
  { iso: 'cy', code: '+357' }, { iso: 'gr', code: '+30'  }, { iso: 'gb', code: '+44'  },
  { iso: 'de', code: '+49'  }, { iso: 'fr', code: '+33'  }, { iso: 'it', code: '+39'  },
  { iso: 'es', code: '+34'  }, { iso: 'pt', code: '+351' }, { iso: 'nl', code: '+31'  },
  { iso: 'be', code: '+32'  }, { iso: 'at', code: '+43'  }, { iso: 'ch', code: '+41'  },
  { iso: 'se', code: '+46'  }, { iso: 'no', code: '+47'  }, { iso: 'dk', code: '+45'  },
  { iso: 'fi', code: '+358' }, { iso: 'pl', code: '+48'  }, { iso: 'cz', code: '+420' },
  { iso: 'sk', code: '+421' }, { iso: 'hu', code: '+36'  }, { iso: 'ro', code: '+40'  },
  { iso: 'bg', code: '+359' }, { iso: 'rs', code: '+381' }, { iso: 'hr', code: '+385' },
  { iso: 'si', code: '+386' }, { iso: 'al', code: '+355' }, { iso: 'mk', code: '+389' },
  { iso: 'ba', code: '+387' }, { iso: 'me', code: '+382' }, { iso: 'ru', code: '+7'   },
  { iso: 'ua', code: '+380' }, { iso: 'tr', code: '+90'  }, { iso: 'il', code: '+972' },
  { iso: 'lb', code: '+961' }, { iso: 'jo', code: '+962' }, { iso: 'sa', code: '+966' },
  { iso: 'ae', code: '+971' }, { iso: 'eg', code: '+20'  }, { iso: 'us', code: '+1'   },
  { iso: 'ca', code: '+1'   }, { iso: 'au', code: '+61'  }, { iso: 'nz', code: '+64'  },
  { iso: 'jp', code: '+81'  }, { iso: 'cn', code: '+86'  }, { iso: 'in', code: '+91'  },
  { iso: 'br', code: '+55'  }, { iso: 'ar', code: '+54'  }, { iso: 'mx', code: '+52'  },
  { iso: 'za', code: '+27'  },
]

export function CountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const current = COUNTRIES[value]
  const needle = query.replace(/^\+/, '').trim()
  const filtered = COUNTRIES
    .map((c, i) => ({ ...c, i }))
    .filter(c => !needle || c.code.replace('+', '').startsWith(needle))

  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 60) }
  }, [open])

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 h-[52px] px-3 border border-[#D1CAC1] rounded-xl bg-white hover:border-[#1C1917] focus:outline-none focus:border-[#1C1917] transition-colors"
        style={{ minWidth: '94px' }}
      >
        <Flag iso={current.iso} />
        <span className="text-[14px] font-semibold text-[#1C1917] tabular-nums">{current.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E] shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-[20] bg-white rounded-xl border border-[#E8E0D8] shadow-[0_8px_24px_rgba(28,25,23,0.13)] overflow-hidden flex flex-col"
          style={{ width: '150px', maxHeight: '256px' }}>
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#F0EAE3] shrink-0">
            <Search className="w-3.5 h-3.5 text-[#C8C0B8] shrink-0" />
            <input ref={inputRef} type="text" inputMode="numeric" value={query}
              onChange={e => setQuery(e.target.value)} placeholder="+357"
              className="flex-1 min-w-0 text-[13px] text-[#1C1917] placeholder-[#C8C0B8] outline-none bg-transparent" />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="text-center text-[12px] text-[#A8A29E] py-5">—</p>
            ) : filtered.map(({ iso, code, i }) => (
              <button key={i} type="button" onClick={() => { onChange(i); setOpen(false); setQuery('') }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${i === value ? 'bg-[#F5F0EB]' : 'hover:bg-[#F8F5F2]'}`}>
                <Flag iso={iso} />
                <span className="text-[13px] font-semibold text-[#1C1917] tabular-nums">{code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
